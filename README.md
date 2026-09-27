# Азария — вики

Статическая вики по миру «Азария» (медивал-деп-панк). Статьи — Markdown в репозитории, сборка — SvelteKit в статику, раздача — nginx в Docker.

- **Прод:** https://azaria.hlofiys.xyz
- **Канон мира:** `azaria_lore.md` (исходная «библия» лора)

## Стек

SvelteKit 2 (`@sveltejs/adapter-static`, полный пререндер) · Svelte 5 · Tailwind 4 + daisyUI · PWA (`@vite-pwa/sveltekit`) · marked / mdsvex / yaml · Docker (multi-stage) → nginx · GitHub Actions → ghcr.io.

## Структура

```
src/lib/lore-content/<категория>/<slug>.md   статьи (6 категорий)
src/lib/entity-map.json                      карта «название → статья» для [[ссылок]] (генерируется!)
src/routes/                                  страницы: главная, категории, статьи, поиск
src/lib/server/lore-parser.ts                парсер статей и вики-ссылок
scripts/smoke-test.sh                        smoke-тесты собранного образа
scripts/generate-entity-map.mjs              генератор entity-map из статей
nginx.conf, security-headers.conf            конфиг раздачи и заголовки безопасности
```

## Команды

```sh
npm ci                  # установка зависимостей
npm run dev             # дев-сервер (http://localhost:5173)
npm run build           # сборка статики в build/
npm run preview         # локальный предпросмотр сборки
npm run check           # svelte-check (типы, a11y)
npm run lint            # prettier + eslint
npm run map:generate    # перегенерировать entity-map.json из статей

make smoke              # smoke-тесты образа (нужен собранный image)
make build / make run   # собрать/запустить образ (host 8080 → контейнер 80)
docker compose up -d    # запуск по docker-compose
```

## Статьи

- Frontmatter: `title`, `tags`; инфобокс умеет `faction`, `type`, `status`, `age`, `population`, `image`, `ruler`, `era` и др.
- Вики-ссылки: `[[Название статьи]]` — резолвятся через `entity-map.json`. После добавления/переименования статей запускайте `npm run map:generate`.
- Категории: `characters`, `locations`, `factions`, `artifacts`, `concepts`, `creatures`.

## Деплой

GitHub Actions:

- `Checks` — svelte-check, lint и docker smoke-тесты;
- `Build and Push Docker Image` — сборка multi-arch образа в `ghcr.io/hlofiys/azaria-wiki`.

На сервере: `docker compose up -d` (образ подтянется из ghcr.io).

## Заметки

- **nginx:** `$uri.html` проверяется раньше `$uri/` — иначе прямые ссылки на статьи отдают 301→403 (каталоги `__data.json` из adapter-static). Не меняйте порядок; smoke-тесты это стерегут.
- Заголовки безопасности продублированы в локациях через `include security-headers.conf` — правило наследования `add_header` в nginx: локация со своими `add_header` теряет унаследованные.
- Админка `/admin` (Decap CMS) без авторизации нерабочая — статьи правятся через git.
