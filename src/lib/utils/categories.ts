import type { CategoryType } from '$lib/icons';

export const categoryNames: Record<CategoryType, { single: string; plural: string }> = {
	characters: { single: 'Персонаж', plural: 'Персонажи' },
	locations: { single: 'Локация', plural: 'Локации' },
	factions: { single: 'Фракция', plural: 'Фракции' },
	artifacts: { single: 'Артефакт', plural: 'Артефакты' },
	concepts: { single: 'Концепция', plural: 'Концепции' },
	creatures: { single: 'Существо', plural: 'Существа' }
};

export function getCategoryName(
	category: CategoryType,
	form: 'single' | 'plural' = 'plural'
): string {
	return categoryNames[category]?.[form] ?? category;
}
