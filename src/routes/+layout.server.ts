import { getAllEntriesFlat } from '$lib/server/lore-parser';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	// Get all entries for client-side functionality
	const allEntries = getAllEntriesFlat();
	
	return {
		allEntries
	};
};