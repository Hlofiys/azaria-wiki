// Client-side data access for static builds
import type { EntryListItem } from './server/lore-parser.js';
import type { CategoryType } from './icons.js';

// This will be populated at build time
let allEntries: EntryListItem[] = [];

/**
 * Initialize client data - this should be called with data from the server at build time
 */
export function initializeClientData(entries: EntryListItem[]) {
	allEntries = entries;
}

/**
 * Get all entries (client-side version)
 */
export function getAllEntries(): EntryListItem[] {
	return allEntries;
}

/**
 * Search entries by title or content (client-side version)
 */
export function searchEntries(query: string): EntryListItem[] {
	const lowerQuery = query.toLowerCase();
	
	return allEntries.filter(
		(entry) =>
			(entry.title || '').toLowerCase().includes(lowerQuery) ||
			(entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)))
	);
}

/**
 * Get a random entry (client-side version)
 */
export function getRandomEntry(): EntryListItem | undefined {
	if (allEntries.length === 0) return undefined;
	
	const randomIndex = Math.floor(Math.random() * allEntries.length);
	return allEntries[randomIndex];
}