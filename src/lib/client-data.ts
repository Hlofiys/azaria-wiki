// Optimized client-side data access for static builds
import type { EntryListItem } from './server/lore-parser.js';
import type { CategoryType } from './icons.js';
import { cachedSearch, warmCache } from './cache/lore-cache.js';
import { OptimizedSearchIndex } from './utils/optimized-search.js';

// Data storage
let allEntries: EntryListItem[] = [];
const entriesByCategory: Map<CategoryType, EntryListItem[]> = new Map();
let searchIndex: OptimizedSearchIndex | null = null;
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
	if (typeof window !== 'undefined') {
		requestIdleCallback(() => buildSearchIndex(), { timeout: 1000 });
	} else {
		setTimeout(() => buildSearchIndex(), 0);
	}

	// Warm cache
	warmCache(entries);
}

/**
 * Build search index for faster searching
 */
function buildSearchIndex() {
	if (isIndexed || allEntries.length === 0) return;

	try {
		searchIndex = new OptimizedSearchIndex(allEntries);
		isIndexed = true;
	} catch (error) {
		console.error('Failed to build search index:', error);
		isIndexed = false;
	}
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
 * Simple search fallback when optimized search is not available
 */
function simpleSearch(query: string): EntryListItem[] {
	const lowerQuery = query.toLowerCase().trim();
	if (lowerQuery.length < 2) return [];

	const queryWords = lowerQuery.split(/\s+/).filter(word => word.length > 1);
	const results: Array<{ entry: EntryListItem; score: number }> = [];

	allEntries.forEach(entry => {
		const score = calculateRelevanceScore(entry, lowerQuery, queryWords);
		if (score > 0) {
			results.push({ entry, score });
		}
	});

	return results
		.sort((a, b) => b.score - a.score)
		.slice(0, 20)
		.map(r => r.entry);
}

/**
 * Calculate relevance score for search results
 */
function calculateRelevanceScore(entry: EntryListItem, query: string, queryWords: string[]): number {
	let score = 0;
	const title = (entry.title || '').toLowerCase();

	// Title matching (highest priority)
	if (title === query) {
		score += 100;
	} else if (title.includes(query)) {
		score += 50;
		if (title.startsWith(query)) {
			score += 25;
		}
	}

	// Individual word matching in title
	queryWords.forEach((word) => {
		if (title.includes(word)) {
			score += 15;
		}
	});

	// Tag matching
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
					score += 8;
				}
			});
		});
	}

	// Metadata matching
	const metadata = [entry.faction, entry.type, entry.status].filter(Boolean);
	metadata.forEach((meta) => {
		const metaLower = meta!.toLowerCase();
		if (metaLower.includes(query)) {
			score += 10;
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
	// Use the OptimizedSearchIndex if available
	if (searchIndex && isIndexed) {
		try {
			const results = searchIndex.search(query, 20);
			return results.map(result => result.entry);
		} catch (error) {
			console.error('Optimized search failed, falling back to simple search:', error);
			return simpleSearch(query);
		}
	}

	// Fallback to simple search if index not ready
	return simpleSearch(query);
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
		indexStats: searchIndex?.getStats() || null
	};
}
