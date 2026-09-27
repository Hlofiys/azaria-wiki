import { getEntry, getBacklinks, getAllEntries, getLinkCounts } from '$lib/server/lore-parser';
import { error } from '@sveltejs/kit';
import type { Entry, EntryListItem } from '$lib/server/lore-parser';
import type { CategoryType } from '$lib/utils/categories';
import type { PageServerLoad } from './$types';

export interface PageData {
	entry: Entry;
	backlinks: EntryListItem[];
	siblings: Array<{ title: string; slug: string }>;
	citations: number;
}

export const load: PageServerLoad<PageData> = async ({ params }) => {
	const { category, slug } = params;

	try {
		const entry = await getEntry(category as CategoryType, slug);

		if (!entry) {
			throw error(404, 'Entry not found');
		}

		const [backlinks, linkCounts] = await Promise.all([
			getBacklinks(category as CategoryType, slug),
			Promise.resolve(getLinkCounts())
		]);

		const siblings = getAllEntries(category as CategoryType).map((item) => ({
			title: item.title,
			slug: item.slug
		}));

		return {
			entry,
			backlinks,
			siblings,
			citations: linkCounts[(entry.metadata.title ?? '').toLowerCase()] ?? 0
		};
	} catch (err) {
		console.error(`Error loading entry ${category}/${slug}:`, err);
		throw error(404, 'Entry not found');
	}
};
