// Optimized search implementation with efficient data structures
import type { EntryListItem } from '$lib/server/lore-parser';

export interface SearchResult {
	entry: EntryListItem;
	score: number;
}

export class OptimizedSearchIndex {
	private titleIndex = new Map<string, Set<number>>();
	private tagIndex = new Map<string, Set<number>>();
	private metadataIndex = new Map<string, Set<number>>();
	private entries: EntryListItem[] = [];
	private isBuilt = false;

	constructor(entries: EntryListItem[]) {
		this.entries = entries;
		this.buildIndex();
	}

	private buildIndex(): void {
		if (this.isBuilt) return;

		// Clear existing indices
		this.titleIndex.clear();
		this.tagIndex.clear();
		this.metadataIndex.clear();

		this.entries.forEach((entry, index) => {
			// Index title words
			const titleWords = (entry.title || '').toLowerCase().split(/\s+/).filter(word => word.length > 1);
			titleWords.forEach(word => {
				if (!this.titleIndex.has(word)) {
					this.titleIndex.set(word, new Set());
				}
				this.titleIndex.get(word)!.add(index);
			});

			// Index tags
			if (entry.tags) {
				entry.tags.forEach(tag => {
					const tagWords = tag.toLowerCase().split(/\s+/).filter(word => word.length > 1);
					tagWords.forEach(word => {
						if (!this.tagIndex.has(word)) {
							this.tagIndex.set(word, new Set());
						}
						this.tagIndex.get(word)!.add(index);
					});
				});
			}

			// Index metadata
			const metadata = [entry.faction, entry.type, entry.status].filter(Boolean);
			metadata.forEach(meta => {
				const words = meta!.toLowerCase().split(/\s+/).filter(word => word.length > 1);
				words.forEach(word => {
					if (!this.metadataIndex.has(word)) {
						this.metadataIndex.set(word, new Set());
					}
					this.metadataIndex.get(word)!.add(index);
				});
			});
		});

		this.isBuilt = true;
	}

	search(query: string, limit = 20): SearchResult[] {
		if (!this.isBuilt || query.length < 2) {
			return [];
		}

		const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
		if (queryWords.length === 0) {
			return [];
		}

		const candidateIndices = new Set<number>();
		const scoreMap = new Map<number, number>();

		// Find all matching entries
		queryWords.forEach(word => {
			// Exact word matches
			const titleMatches = this.titleIndex.get(word) || new Set();
			const tagMatches = this.tagIndex.get(word) || new Set();
			const metadataMatches = this.metadataIndex.get(word) || new Set();

			// Add candidates from exact matches
			titleMatches.forEach(idx => {
				candidateIndices.add(idx);
				scoreMap.set(idx, (scoreMap.get(idx) || 0) + 50); // High score for title match
			});

			tagMatches.forEach(idx => {
				candidateIndices.add(idx);
				scoreMap.set(idx, (scoreMap.get(idx) || 0) + 30); // Medium score for tag match
			});

			metadataMatches.forEach(idx => {
				candidateIndices.add(idx);
				scoreMap.set(idx, (scoreMap.get(idx) || 0) + 20); // Lower score for metadata match
			});

			// Partial matches (prefix search)
			for (const [indexedWord, indices] of this.titleIndex) {
				if (indexedWord.startsWith(word)) {
					indices.forEach(idx => {
						candidateIndices.add(idx);
						scoreMap.set(idx, (scoreMap.get(idx) || 0) + 25); // Prefix match bonus
					});
				}
			}
		});

		// Calculate final scores and create results
		const results: SearchResult[] = [];
		candidateIndices.forEach(index => {
			const entry = this.entries[index];
			let score = scoreMap.get(index) || 0;

			// Bonus for exact title match
			const lowerTitle = (entry.title || '').toLowerCase();
			const lowerQuery = query.toLowerCase();
			if (lowerTitle === lowerQuery) {
				score += 100;
			} else if (lowerTitle.startsWith(lowerQuery)) {
				score += 50;
			}

			// Multi-word query bonus
			if (queryWords.length > 1) {
				const matchingWords = queryWords.filter(word => 
					lowerTitle.includes(word) || 
					(entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(word)))
				);
				score += matchingWords.length * 10;
			}

			results.push({ entry, score });
		});

		// Sort by score and limit results
		return results
			.sort((a, b) => b.score - a.score)
			.slice(0, limit);
	}

	getStats() {
		return {
			entriesCount: this.entries.length,
			titleIndexSize: this.titleIndex.size,
			tagIndexSize: this.tagIndex.size,
			metadataIndexSize: this.metadataIndex.size,
			isBuilt: this.isBuilt
		};
	}
}