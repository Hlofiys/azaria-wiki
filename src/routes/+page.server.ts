import { getAllEntries, getAllEntriesFlat, getLinkCounts } from '$lib/server/lore-parser';
import type { EntryListItem } from '$lib/server/lore-parser';
import { CATEGORY_ORDER } from '$lib/utils/categories';
import type { CategoryType } from '$lib/utils/categories';
import type { PageServerLoad } from './$types';

export interface PageData {
	featuredEntries: EntryListItem[];
	slotMachineEntries: EntryListItem[];
	recentEntries: EntryListItem[];
	topCited: Array<EntryListItem & { citations: number }>;
	categoryCounts: Record<CategoryType, number>;
	totalEntries: number;
}

const byMostRecent = (a: EntryListItem, b: EntryListItem) =>
	new Date(b.updated ?? 0).getTime() - new Date(a.updated ?? 0).getTime();

export const load: PageServerLoad<PageData> = async () => {
	try {
		const allEntries = getAllEntriesFlat();
		const linkCounts = getLinkCounts();

		const categoryCounts = CATEGORY_ORDER.reduce(
			(acc, category) => {
				acc[category] = getAllEntries(category).length;
				return acc;
			},
			{} as Record<CategoryType, number>
		);

		// One entry per category, as a representative cross-section.
		const featuredEntries = CATEGORY_ORDER.map(
			(category) => allEntries.find((entry) => entry.category === category) ?? null
		).filter((entry): entry is EntryListItem => entry !== null);

		// Most linked-to entries — the ledger's most cited records.
		const topCited = [...allEntries]
			.map((entry) => ({ ...entry, citations: linkCounts[entry.title.toLowerCase()] ?? 0 }))
			.filter((entry) => entry.citations > 0)
			.sort((a, b) => b.citations - a.citations || a.title.localeCompare(b.title, 'ru'))
			.slice(0, 6);

		const recentEntries = [...allEntries].sort(byMostRecent).slice(0, 6);

		const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
		const slotMachineEntries = shuffled.slice(0, 48);

		return {
			featuredEntries,
			slotMachineEntries,
			recentEntries,
			topCited,
			categoryCounts,
			totalEntries: allEntries.length
		};
	} catch (error) {
		console.error('Error loading homepage data:', error);
		return {
			featuredEntries: [],
			slotMachineEntries: [],
			recentEntries: [],
			topCited: [],
			categoryCounts: {} as Record<CategoryType, number>,
			totalEntries: 0
		};
	}
};
