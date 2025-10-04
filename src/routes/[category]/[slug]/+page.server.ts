import { getEntry, getBacklinks } from '$lib/server/lore-parser';
import { error } from '@sveltejs/kit';
import type { Entry, EntryListItem } from '$lib/server/lore-parser';
import type { CategoryType } from '$lib/icons';
import type { PageServerLoad } from './$types';

export interface PageData {
	entry: Entry;
	backlinks: EntryListItem[];
}

export const load: PageServerLoad<PageData> = async ({ params }) => {
	const { category, slug } = params;

	try {
		const entry = await getEntry(category as CategoryType, slug);

		if (!entry) {
			throw error(404, 'Entry not found');
		}

		const backlinks = await getBacklinks(category as CategoryType, slug);

		return {
			entry,
			backlinks
		};
	} catch (err) {
		console.error(`Error loading entry ${category}/${slug}:`, err);
		throw error(404, 'Entry not found');
	}
};
