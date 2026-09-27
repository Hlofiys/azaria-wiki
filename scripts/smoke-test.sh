#!/usr/bin/env bash
# Smoke tests for the Azaria Wiki container image.
#
# Usage: bash scripts/smoke-test.sh [image] [host_port]
#
# Guards the regressions fixed in 2026-09:
#  - deep article links must not 301→403 (nginx try_files order vs __data.json dirs)
#  - security headers must actually reach the client (add_header inheritance)
#  - sw.js must not be cached immutably
set -euo pipefail

IMAGE="${1:-azaria-wiki:latest}"
PORT="${2:-8099}"
CONTAINER="azaria-wiki-smoke-$$"

cleanup() { docker rm -f "$CONTAINER" >/dev/null 2>&1 || true; }
trap cleanup EXIT

echo "▶ Запускаю $IMAGE на порту $PORT ..."
docker run -d --name "$CONTAINER" -p "${PORT}:80" "$IMAGE" >/dev/null

ready=0
for _ in $(seq 1 30); do
	if curl -fsS "http://localhost:${PORT}/health" >/dev/null 2>&1; then
		ready=1
		break
	fi
	sleep 1
done
if [ "$ready" != "1" ]; then
	echo "✗ контейнер не ответил на /health"
	docker logs "$CONTAINER" 2>&1 | tail -20
	exit 1
fi

fail=0

check() { # check <path> <expected_code> <label>
	local code
	code=$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:${PORT}$1" || echo 000)
	if [ "$code" = "$2" ]; then
		echo "  ✓ $1 → $code  ($3)"
	else
		echo "  ✗ $1 → $code, ожидался $2  ($3)"
		fail=1
	fi
}

hdr() { # hdr <path> <regexp> <label>
	if curl -sI "http://localhost:${PORT}$1" | grep -qiE "$2"; then
		echo "  ✓ заголовок: $2  ($3)"
	else
		echo "  ✗ отсутствует заголовок: $2  ($3)"
		fail=1
	fi
}

echo "▶ Базовые страницы"
check / 200 "главная"
check /health 200 "health-check"
check /robots.txt 200 "robots.txt"
check /characters 200 "категория"
check /search 200 "поиск"

echo "▶ Прямые ссылки на статьи (регресс 301→403). Слаги должны существовать в контенте:"
check /characters/kazich-depich-iii 200 "статья"
check /characters/kazich-depich-iii/ 200 "статья со слешем"
check /concepts/nedonos 200 "статья"
check /locations/kosye-slotiki 200 "статья"

echo "▶ Заголовки"
hdr / "content-security-policy" "CSP доезжает до клиента"
hdr / "x-frame-options" "X-Frame-Options"
hdr / "x-content-type-options" "X-Content-Type-Options"
hdr /sw.js "cache-control: no-cache" "sw.js не кэшируется надолго"

echo "▶ Пре-сжатие"
if curl -s -H 'Accept-Encoding: gzip' -D - -o /dev/null "http://localhost:${PORT}/" | grep -qi 'content-encoding: gzip'; then
	echo "  ✓ precompressed .gz отдаётся"
else
	echo "  ✗ .gz не отдаётся (проверьте gzip_static)"
	fail=1
fi

if [ "$fail" = "0" ]; then
	echo "✅ Все проверки пройдены"
else
	echo "❌ Есть провалы"
fi
exit "$fail"
