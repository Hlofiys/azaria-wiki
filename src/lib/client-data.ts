// Optimized client-side data access for static builds
import type { EntryListItem } from './server/lore-parser.js';
import type { CategoryType } from './icons.js';
import { cachedSearch, warmCache } from './cache/lore-cache.js';

// Data storage
let allEntries: EntryListItem[] = [];
const entriesByCategory: Map<CategoryType, EntryListItem[]> = new Map();
const searchIndex: Map<string, Set<number>> = new Map(); // word -> entry indices
let isIndexed = false;

/**
 * Initialize client data with performance optimizations
 */
export function initializeClientData(entries: EntryListItem[]) {
	allEntries = entries;

	// Organize by category for faster lookups
	entriesByCategory.clear();
	const categories: CategoryType[] = [
		'characters',
		'locations',
		'factions',
		'artifacts',
		'concepts',
		'creatures'
	];

	categories.forEach((category) => {
		const categoryEntries = entries.filter((entry) => entry.category === category);
		entriesByCategory.set(category, categoryEntries);
	});

	// Build search index asynchronously
	setTimeout(() => buildSearchIndex(), 0);

	// Warm cache
	warmCache(entries);
}

/**
 * Build search index for faster searching
 */
function buildSearchIndex() {
	if (isIndexed) return;

	searchIndex.clear();

	allEntries.forEach((entry, index) => {
		// Index title words
		const titleWords = (entry.title || '').toLowerCase().split(/\s+/);
		titleWords.forEach((word) => {
			if (word.length > 1) {
				if (!searchIndex.has(word)) {
					searchIndex.set(word, new Set());
				}
				searchIndex.get(word)!.add(index);
			}
		});

		// Index tags
		if (entry.tags) {
			entry.tags.forEach((tag) => {
				const tagWords = tag.toLowerCase().split(/\s+/);
				tagWords.forEach((word) => {
					if (word.length > 1) {
						if (!searchIndex.has(word)) {
							searchIndex.set(word, new Set());
						}
						searchIndex.get(word)!.add(index);
					}
				});
			});
		}

		// Index metadata
		const metadata = [entry.faction, entry.type, entry.status].filter(Boolean);
		metadata.forEach((meta) => {
			const words = meta!.toLowerCase().split(/\s+/);
			words.forEach((word) => {
				if (word.length > 1) {
					if (!searchIndex.has(word)) {
						searchIndex.set(word, new Set());
					}
					searchIndex.get(word)!.add(index);
				}
			});
		});
	});

	isIndexed = true;
}

/**
 * Get all entries (client-side version)
 */
export function getAllEntries(): EntryListItem[] {
	return allEntries;
}

/**
 * Get entries by category (optimized)
 */
export function getEntriesByCategory(category: CategoryType): EntryListItem[] {
	return entriesByCategory.get(category) || [];
}

/**
 * Optimized search with caching and indexing
 */
export function searchEntries(query: string): EntryListItem[] {
	// Use cached search first
	const cachedResult = cachedSearch(query, allEntries);
	if (cachedResult.length > 0) {
		return cachedResult;
	}

	// Fallback to index-based search if index is ready
	if (isIndexed && query.length >= 2) {
		return indexedSearch(query);
	}

	// Fallback to simple search
	return simpleSearch(query);
}

/**
 * Index-based search for better performance
 */
function indexedSearch(query: string): EntryListItem[] {
	const lowerQuery = query.toLowerCase().trim();
	const queryWords = lowerQuery.split(/\s+/).filter((word) => word.length > 1);

	if (queryWords.length === 0) return [];

	// Find entries that match any query word
	const matchingIndices = new Set<number>();

	queryWords.forEach((word) => {
		// Exact word matches
		if (searchIndex.has(word)) {
			searchIndex.get(word)!.forEach((index) => matchingIndices.add(index));
		}

		// Partial word matches
		for (const [indexedWord, indices] of searchIndex.entries()) {
			if (indexedWord.includes(word) || word.includes(indexedWord)) {
				indices.forEach((index) => matchingIndices.add(index));
			}
		}
	});

	// Convert indices to entries and rank them
	const results: Array<{ entry: EntryListItem; score: number }> = [];

	matchingIndices.forEach((index) => {
		const entry = allEntries[index];
		if (entry) {
			const score = calculateRelevanceScore(entry, lowerQuery, queryWords);
			if (score > 0) {
				results.push({ entry, score });
			}
		}
	});

	// Sort by relevance and return top results
	return results
		.sort((a, b) => b.score - a.score)
		.slice(0, 20)
		.map((r) => r.entry);
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(
	entry: EntryListItem,
	query: string,
	queryWords: string[]
): number {
	let score = 0;
	const title = (entry.title || '').toLowerCase();

	// Exact title match
	if (title === query) {
		score += 100;
	} else if (title.includes(query)) {
		score += 50;
		// Bonus for match at start
		if (title.startsWith(query)) {
			score += 25;
		}
	}

	// Word matches in title
	queryWords.forEach((word) => {
		if (title.includes(word)) {
			score += 20;
			if (title.startsWith(word)) {
				score += 10;
			}
		}
	});

	// Tag matches
	if (entry.tags) {
		entry.tags.forEach((tag) => {
			const tagLower = tag.toLowerCase();
			if (tagLower === query) {
				score += 30;
			} else if (tagLower.includes(query)) {
				score += 15;
			}

			queryWords.forEach((word) => {
				if (tagLower.includes(word)) {
					score += 10;
				}
			});
		});
	}

	// Metadata matches
	const metadata = [entry.faction, entry.type, entry.status].filter(Boolean);
	metadata.forEach((meta) => {
		const metaLower = meta!.toLowerCase();
		if (metaLower.includes(query)) {
			score += 15;
		}
		queryWords.forEach((word) => {
			if (metaLower.includes(word)) {
				score += 5;
			}
		});
	});

	return score;
}

/**
 * Simple search fallback
 */
function simpleSearch(query: string): EntryListItem[] {
	const lowerQuery = query.toLowerCase().trim();
	if (lowerQuery.length < 2) return [];

	return allEntries
		.filter((entry) => {
			const title = (entry.title || '').toLowerCase();
			const tags = entry.tags || [];

			return (
				title.includes(lowerQuery) ||
				tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
				(entry.faction && entry.faction.toLowerCase().includes(lowerQuery)) ||
				(entry.type && entry.type.toLowerCase().includes(lowerQuery))
			);
		})
		.slice(0, 20);
}

/**
 * Get a random entry (optimized)
 */
export function getRandomEntry(): EntryListItem | undefined {
	if (allEntries.length === 0) return undefined;

	const randomIndex = Math.floor(Math.random() * allEntries.length);
	return allEntries[randomIndex];
}

/**
 * Get multiple random entries
 */
export function getRandomEntries(count: number): EntryListItem[] {
	if (allEntries.length === 0) return [];

	const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, Math.min(count, allEntries.length));
}

/**
 * Get statistics about the data
 */
export function getDataStats() {
	return {
		totalEntries: allEntries.length,
		categoryCounts: Array.from(entriesByCategory.entries()).reduce(
			(acc, [category, entries]) => {
				acc[category] = entries.length;
				return acc;
			},
			{} as Record<CategoryType, number>
		),
		isIndexed,
		indexSize: searchIndex.size
	};
}
