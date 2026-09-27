/**
 * Category vocabulary — pure data, safe to import from server and client code.
 * Colours are CSS tokens in src/app.css; set `data-seal={category}` on a subtree.
 */

export type CategoryType =
	'characters' | 'locations' | 'factions' | 'artifacts' | 'concepts' | 'creatures';

export const CATEGORY_ORDER: CategoryType[] = [
	'characters',
	'locations',
	'factions',
	'artifacts',
	'concepts',
	'creatures'
];

export const categoryNames: Record<CategoryType, { single: string; plural: string }> = {
	characters: { single: 'Персонаж', plural: 'Персонажи' },
	locations: { single: 'Локация', plural: 'Локации' },
	factions: { single: 'Фракция', plural: 'Фракции' },
	artifacts: { single: 'Артефакт', plural: 'Артефакты' },
	concepts: { single: 'Концепция', plural: 'Концепции' },
	creatures: { single: 'Существо', plural: 'Существа' }
};

export const categoryDescriptions: Record<CategoryType, string> = {
	characters: 'Влиятельные личности мира Азарии',
	locations: 'Города, крепости и загадочные места',
	factions: 'Государства, организации и союзы',
	artifacts: 'Магические предметы и реликвии',
	concepts: 'Философии и принципы мира Азарии',
	creatures: 'Монстры, демоны и фантастические создания'
};

export const categoryIcons: Record<CategoryType, string> = {
	characters: 'mdi:crown',
	locations: 'mdi:castle',
	factions: 'mdi:sword-cross',
	artifacts: 'mdi:star-circle',
	concepts: 'mdi:scale-balance',
	creatures: 'game-icons:sea-dragon'
};

/** «К разделу «Артефакты»» — avoids fragile Russian declension by hand. */
export const categorySectionLabels: Record<CategoryType, string> = {
	characters: 'К разделу «Персонажи»',
	locations: 'К разделу «Локации»',
	factions: 'К разделу «Фракции»',
	artifacts: 'К разделу «Артефакты»',
	concepts: 'К разделу «Концепции»',
	creatures: 'К разделу «Существа»'
};

export function getCategoryName(
	category: CategoryType,
	form: 'single' | 'plural' = 'plural'
): string {
	return categoryNames[category]?.[form] ?? category;
}

export function getCategoryDescription(category: CategoryType): string {
	return categoryDescriptions[category] ?? '';
}

export function getCategoryIcon(category: CategoryType): string {
	return categoryIcons[category] ?? 'mdi:book-open-page-variant';
}

export function getCategorySectionLabel(category: CategoryType): string {
	return categorySectionLabels[category] ?? 'К разделу';
}

/** Short record number, e.g. АРТ-047. Gives every entry a ledger folio. */
export function entryFolio(category: CategoryType, slug: string): string {
	const prefixes: Record<CategoryType, string> = {
		characters: 'ПРС',
		locations: 'ЛОК',
		factions: 'ФРК',
		artifacts: 'АРТ',
		concepts: 'КНЦ',
		creatures: 'СЩВ'
	};

	let hash = 0;
	for (let i = 0; i < slug.length; i += 1) {
		hash = (hash * 31 + slug.charCodeAt(i)) % 10000;
	}

	return `${prefixes[category] ?? 'ЗПС'}-${String(hash).padStart(3, '0')}`;
}
