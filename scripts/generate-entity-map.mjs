#!/usr/bin/env node
/**
 * Генерирует src/lib/entity-map.json из статей src/lib/lore-content.
 *
 * Карта связывает название статьи (в нижнем регистре) с её категорией и slug;
 * используется для резолва вики-ссылок [[Название]] в src/lib/server/lore-parser.ts.
 *
 * Запуск: npm run map:generate
 */
import fs from 'node:fs';
import path from 'node:path';

const CONTENT_DIR = path.resolve('src/lib/lore-content');
const OUT_FILE = path.resolve('src/lib/entity-map.json');
const CATEGORIES = ['characters', 'locations', 'factions', 'artifacts', 'concepts', 'creatures'];

const map = {};
let duplicates = 0;

for (const category of CATEGORIES) {
	const dir = path.join(CONTENT_DIR, category);
	if (!fs.existsSync(dir)) continue;

	for (const file of fs
		.readdirSync(dir)
		.filter((f) => f.endsWith('.md'))
		.sort()) {
		const slug = path.basename(file, '.md');
		const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
		const fm = raw.match(/^---\s*\n([\s\S]*?)\n---/);
		const titleMatch = fm ? fm[1].match(/^title:\s*(.+?)\s*$/m) : null;
		const title = (titleMatch ? titleMatch[1] : slug).replace(/^["']|["']$/g, '');
		const key = title.toLowerCase();

		if (map[key]) {
			duplicates++;
			console.warn(
				`  ! дубликат названия: «${title}» (${category}/${slug}) перезаписывает ${map[key].category}/${map[key].slug}`
			);
		}
		map[key] = { category, slug, title };
	}
}

const sorted = Object.fromEntries(Object.entries(map).sort(([a], [b]) => a.localeCompare(b, 'ru')));
fs.writeFileSync(OUT_FILE, `${JSON.stringify(sorted, null, '\t')}\n`);
console.log(
	`✓ entity-map.json: ${Object.keys(sorted).length} записей${duplicates ? `, дубликатов: ${duplicates}` : ''}`
);
