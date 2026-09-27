import { getAllEntries, getCategoryInfo } from '$lib/server/lore-parser';
import { error } from '@sveltejs/kit';
import type { EntryListItem, CategoryInfo } from '$lib/server/lore-parser';
import { CATEGORY_ORDER, type CategoryType } from '$lib/utils/categories';
import type { PageServerLoad } from './$types';

export interface PageData {
	entries: EntryListItem[];
	categoryInfo: CategoryInfo;
	category: CategoryType;
	allCategories: CategoryType[];
	categoryCounts: Record<string, number>;
}

export const load: PageServerLoad<PageData> = async ({ params }) => {
	const { category } = params;

	if (!CATEGORY_ORDER.includes(category as CategoryType)) {
		throw error(404, 'Category not found');
	}

	const typedCategory = category as CategoryType;

	try {
		const entries = getAllEntries(typedCategory);
		const categoryInfo = getCategoryInfo(typedCategory);

		const categoryCounts = CATEGORY_ORDER.reduce(
			(acc, item) => {
				acc[item] = item === typedCategory ? entries.length : getAllEntries(item).length;
				return acc;
			},
			{} as Record<string, number>
		);

		return {
			entries,
			categoryInfo,
			category: typedCategory,
			allCategories: CATEGORY_ORDER.filter((item) => item !== typedCategory),
			categoryCounts
		};
	} catch (err) {
		console.error(`Error loading category ${category}:`, err);
		throw error(500, 'Failed to load entries');
	}
};
