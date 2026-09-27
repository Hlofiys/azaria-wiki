# Азария — вики

Статическая вики по миру «Азария» (медивал-деп-панк). Статьи — Markdown в репозитории, сборка — SvelteKit в статику, раздача — nginx в Docker.

- **Прод:** https://azaria.hlofiys.xyz
- **Канон мира:** `azaria_lore.md` (исходная «библия» лора)

## Стек

SvelteKit 2 (`@sveltejs/adapter-static`, полный пререндер) · Svelte 5 · Tailwind 4 · PWA (`@vite-pwa/sveltekit`) · marked / mdsvex / yaml · Docker (multi-stage) → nginx · GitHub Actions → ghcr.io.

## Дизайн-система «Гроссбух»

Визуальный язык: средневековая хроника, свёрстанная как бухгалтерская книга — тёплый сливовый фон, латунные волосяные линии, засечки-уголки, сургучные печати. Одно место правды — токены в `src/app.css` (`@theme`), в компонентах нет ни одного hex.

- **Палитра:** `ink-900…600` (фон/панели), `line`/`line-strong` (волосяные линии), `parchment`/`-dim`/`-mute` (текст), `brass`/`-bright`/`-deep` (идентичность), `seal-*` (по одной на раздел), `ok`/`danger`.
- **Цвет раздела:** ставится атрибутом `data-seal={category}` на поддерево; CSS выводит `--seal`, `--seal-tint`, `--seal-line`. Утилиты: `.seal-text`, `.seal-border`, `.seal-bg`.
- **Шрифты:** Prata (заголовки), Lora (текст), IBM Plex Mono (надписи, цифры, фолио) — самохостятся в `static/fonts` с кириллическими сабсетами. Cinzel Decorative убран: в нём нет кириллицы.
- **Материалы:** `.frame` (гравированная рамка с уголками), `.surface`, `.stamp` (печать), `.chip`, `.leader`/`.leader__dots` (строки с отточием), `.plate` (клеймо записи), `.chronicle` (типографика статей, буквица).
- **Иконки:** собираются в офлайн-коллекцию через `npm run icons:generate` (`scripts/generate-icons.mjs` → `src/lib/icons/collection.ts`), в рантайме ничего не запрашивается.
- **Префикс фолио:** каждая запись получает номер вида `АРТ-4857` (`entryFolio` в `src/lib/utils/categories.ts`).

## Структура

```
src/lib/lore-content/<категория>/<slug>.md   статьи (6 категорий)
src/lib/entity-map.json                      карта «название → статья» для [[ссылок]] (генерируется!)
src/routes/                                  страницы: главная, категории, статьи, поиск
src/lib/components/ui/                       примитивы: frame, chip, stamp, dossier, slot-machine, lore-card…
src/lib/utils/categories.ts                  словарь разделов (названия, описания, иконки, фолио)
src/lib/server/lore-parser.ts                парсер статей, вики-ссылок, оглавления и обратных ссылок
src/app.css                                  дизайн-токены, база, материалы, типографика статей
scripts/fetch-fonts.mjs                      загрузка/нарезка шрифтов в static/fonts
scripts/generate-icons.mjs                   сборка офлайн-коллекции иконок
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
npm run icons:generate  # пересобрать офлайн-коллекцию иконок (после добавления новых иконок)
npm run fonts:fetch     # перекачать шрифты из Google Fonts в static/fonts

make smoke              # smoke-тесты образа (нужен собранный image)
make build / make run   # собрать/запустить образ (host 8080 → контейнер 80)
docker compose up -d    # запуск по docker-compose
```

## Статьи

- Frontmatter: `title`, `tags`; досье умеет `type`, `status`, `faction`, `owner`, `ruler`, `realm`, `creator`, `era`, `age`, `population`, `length`, `effect`, `feature`, `members`, `philosophy`, `specialization`, `access`, `nickname`, `description`, `image`.
- Вики-ссылки: `[[Название статьи]]` — резолвятся через `entity-map.json`. После добавления/переименования статей запускайте `npm run map:generate`.
- Заголовки `##`/`###` автоматически получают якоря (транслит в id) и попадают в оглавление статьи.
- Категории: `characters`, `locations`, `factions`, `artifacts`, `concepts`, `creatures`.
- В карточках и фильтрах раздела используются `tags`; в разделе есть вид «Гроссбух» (таблица) и фильтры `?q=`, `?tag=`, `?sort=`, `?view=ledger`.

## Деплой

GitHub Actions:

- `Checks` — svelte-check, lint и docker smoke-тесты;
- `Build and Push Docker Image` — сборка multi-arch образа в `ghcr.io/hlofiys/azaria-wiki`.

На сервере: `docker compose up -d` (образ подтянется из ghcr.io).

## Заметки

- **nginx:** `$uri.html` проверяется раньше `$uri/` — иначе прямые ссылки на статьи отдают 301→403 (каталоги `__data.json` из adapter-static). Не меняйте порядок; smoke-тесты это стерегут.
- Заголовки безопасности продублированы в локациях через `include security-headers.conf` — правило наследования `add_header` в nginx: локация со своими `add_header` теряет унаследованные.
- **Админка:** `/admin/` — Sveltia CMS. Вход по кнопке «Sign In with Token»: нужен fine-grained GitHub-токен с правом `Contents: Read and write` на этот репозиторий (OAuth-шлюз не настроен — в `config.yml` включён только `auth_methods: [token]`). Токен хранится в localStorage браузера. Загрузки — в `static/images/uploads`.
- **Заголовки админки** — отдельный `security-headers-admin.conf` (CSP шире: unpkg.com, api.github.com, githubstatus, jsdelivr, blob:). Локация `/admin/` — `^~`, чтобы regex-локации ассетов её не перехватывали.
