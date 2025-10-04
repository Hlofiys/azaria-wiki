import { searchEntries } from '$lib/server/lore-parser';
import type { PageServerLoad } from './$types';
import type { EntryListItem } from '$lib/server/lore-parser';

export interface PageData {
	results: EntryListItem[];
	query: string;
}

export const load: PageServerLoad<PageData> = async ({ url }) => {
	const query = url.searchParams.get('q') || '';

	if (!query.trim()) {
		return {
			results: [],
			query: ''
		};
	}

	try {
		const results = searchEntries(query);
		return {
			results,
			query
		};
	} catch (error) {
		console.error('Error searching entries:', error);
		return {
			results: [],
			query
		};
	}
};
