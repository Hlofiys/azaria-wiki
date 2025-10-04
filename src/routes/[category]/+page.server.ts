import { getAllEntries, getCategoryInfo } from '$lib/server/lore-parser';
import { error } from '@sveltejs/kit';
import type { EntryListItem, CategoryInfo } from '$lib/server/lore-parser';
import type { CategoryType } from '$lib/icons';
import type { PageServerLoad } from './$types';

export interface PageData {
	entries: EntryListItem[];
	categoryInfo: CategoryInfo;
	category: CategoryType;
}

export const load: PageServerLoad<PageData> = async ({ params }) => {
	const { category } = params;

	// Validate category
	const validCategories: CategoryType[] = [
		'characters',
		'locations',
		'factions',
		'artifacts',
		'concepts',
		'creatures'
	];

	if (!validCategories.includes(category as CategoryType)) {
		throw error(404, 'Category not found');
	}

	const typedCategory = category as CategoryType;

	try {
		const entries = getAllEntries(typedCategory);
		const categoryInfo = getCategoryInfo(typedCategory);

		return {
			entries,
			categoryInfo,
			category: typedCategory
		};
	} catch (err) {
		console.error(`Error loading category ${category}:`, err);
		throw error(500, 'Failed to load entries');
	}
};
