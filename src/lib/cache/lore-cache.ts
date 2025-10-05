// Advanced caching system for lore data
import type { EntryListItem, Entry } from '$lib/server/lore-parser';
import type { CategoryType } from '$lib/icons';

// In-memory cache for frequently accessed data
class LoreCache {
	private entriesCache = new Map<string, EntryListItem[]>();
	private entryCache = new Map<string, Entry>();
	private searchCache = new Map<string, EntryListItem[]>();
	private lastCacheUpdate = 0;
	private readonly CACHE_TTL = 1000 * 60 * 10; // 10 minutes in development

	constructor() {
		// Clear cache periodically in development
		if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
			setInterval(() => this.clearExpired(), this.CACHE_TTL);
		}
	}

	// Cache entries by category
	setCategoryEntries(category: CategoryType, entries: EntryListItem[]): void {
		this.entriesCache.set(category, entries);
		this.lastCacheUpdate = Date.now();
	}

	getCategoryEntries(category: CategoryType): EntryListItem[] | null {
		if (this.isExpired()) {
			this.clearExpired();
			return null;
		}
		return this.entriesCache.get(category) || null;
	}

	// Cache individual entries
	setEntry(key: string, entry: Entry): void {
		this.entryCache.set(key, entry);
	}

	getEntry(key: string): Entry | null {
		if (this.isExpired()) {
			this.clearExpired();
			return null;
		}
		return this.entryCache.get(key) || null;
	}

	// Cache search results
	setSearchResults(query: string, results: EntryListItem[]): void {
		// Only cache if results are significant
		if (results.length > 0) {
			this.searchCache.set(query.toLowerCase(), results);
		}
	}

	getSearchResults(query: string): EntryListItem[] | null {
		if (this.isExpired()) {
			this.clearExpired();
			return null;
		}
		return this.searchCache.get(query.toLowerCase()) || null;
	}

	// Cache management
	private isExpired(): boolean {
		return Date.now() - this.lastCacheUpdate > this.CACHE_TTL;
	}

	private clearExpired(): void {
		this.entriesCache.clear();
		this.entryCache.clear();
		this.searchCache.clear();
	}

	// Get cache stats for debugging
	getStats() {
		return {
			categories: this.entriesCache.size,
			entries: this.entryCache.size,
			searches: this.searchCache.size,
			lastUpdate: this.lastCacheUpdate
		};
	}

	// Preload commonly accessed data
	preloadCommonData(allEntries: EntryListItem[]): void {
		// Group by category for faster access
		const categories: CategoryType[] = [
			'characters',
			'locations',
			'factions',
			'artifacts',
			'concepts',
			'creatures'
		];

		categories.forEach((category) => {
			const categoryEntries = allEntries.filter((entry) => entry.category === category);
			this.setCategoryEntries(category, categoryEntries);
		});
	}
}

// Singleton instance
export const loreCache = new LoreCache();

// Utility functions for cache warming
export function warmCache(allEntries: EntryListItem[]): void {
	loreCache.preloadCommonData(allEntries);
}

// Optimized search with caching
export function cachedSearch(query: string, allEntries: EntryListItem[]): EntryListItem[] {
	const cached = loreCache.getSearchResults(query);
	if (cached) {
		return cached;
	}

	// Perform search with optimizations
	const lowerQuery = query.toLowerCase().trim();
	if (lowerQuery.length < 2) {
		return [];
	}

	// Smart search with ranking
	const results: Array<{ entry: EntryListItem; score: number }> = [];

	for (const entry of allEntries) {
		let score = 0;
		const title = (entry.title || '').toLowerCase();
		const tags = entry.tags || [];

		// Exact title match gets highest score
		if (title === lowerQuery) {
			score += 100;
		} else if (title.includes(lowerQuery)) {
			// Title contains query
			score += 50;
			// Bonus for match at start
			if (title.startsWith(lowerQuery)) {
				score += 25;
			}
		}

		// Tag matching
		for (const tag of tags) {
			const tagLower = tag.toLowerCase();
			if (tagLower === lowerQuery) {
				score += 30;
			} else if (tagLower.includes(lowerQuery)) {
				score += 15;
			}
		}

		// Category and metadata matching
		if (entry.faction && entry.faction.toLowerCase().includes(lowerQuery)) {
			score += 20;
		}
		if (entry.type && entry.type.toLowerCase().includes(lowerQuery)) {
			score += 15;
		}

		if (score > 0) {
			results.push({ entry, score });
		}
	}

	// Sort by score and limit results
	const sortedResults = results
		.sort((a, b) => b.score - a.score)
		.slice(0, 20) // Limit to top 20 results
		.map((r) => r.entry);

	// Cache the results
	loreCache.setSearchResults(query, sortedResults);

	return sortedResults;
}
