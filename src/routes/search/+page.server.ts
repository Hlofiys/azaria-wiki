import { getAllEntriesFlat } from '$lib/server/lore-parser';
import type { PageServerLoad } from './$types';
import type { EntryListItem } from '$lib/server/lore-parser';

export const prerender = true;

export interface PageData {
	allEntries: EntryListItem[]; // Pass all entries for client-side search
}

export const load: PageServerLoad<PageData> = async () => {
	const allEntries = getAllEntriesFlat();

	// For static builds, we'll do the search entirely on the client side
	return {
		allEntries
	};
};
