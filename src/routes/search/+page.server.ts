import { getAllEntriesFlat } from '$lib/server/lore-parser';
import type { EntryListItem } from '$lib/server/lore-parser';
import type { PageServerLoad } from './$types';

export interface PageData {
	allEntries: EntryListItem[];
	initialQuery: string;
	initialResults: EntryListItem[];
}

export const load: PageServerLoad<PageData> = async ({ url }) => {
	const allEntries = getAllEntriesFlat();
	const initialQuery = url.searchParams.get('q') ?? '';
	const needle = initialQuery.trim().toLowerCase();

	const initialResults = needle
		? allEntries.filter((entry) =>
				[entry.title, entry.type, entry.faction, entry.status, ...(entry.tags ?? [])]
					.filter(Boolean)
					.some((field) => String(field).toLowerCase().includes(needle))
			)
		: [];

	return { allEntries, initialQuery, initialResults };
};
