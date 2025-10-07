import { getAllEntriesFlat } from '$lib/server/lore-parser';
import type { EntryListItem } from '$lib/server/lore-parser';
import type { PageServerLoad } from './$types';

export interface PageData {
	featuredEntries: EntryListItem[];
	slotMachineEntries: EntryListItem[];
	totalEntries: number;
}

export const load: PageServerLoad<PageData> = async () => {
	try {
		const allEntries = getAllEntriesFlat();

		// Get featured entries (first few from each category)
		const featuredEntries: EntryListItem[] = [];
		const categories = [
			'characters',
			'locations',
			'factions',
			'artifacts',
			'concepts',
			'creatures'
		] as const;

		categories.forEach((category) => {
			const categoryEntries = allEntries.filter((entry) => entry.category === category);
			if (categoryEntries.length > 0) {
				featuredEntries.push(categoryEntries[0]); // Add first entry from each category
			}
		});

		// Get random entries for slot machine
		const shuffled = [...allEntries].sort(() => Math.random() - 0.5);
		const slotMachineEntries = shuffled.slice(0, 12); // 12 entries for slot machine animation

		return {
			featuredEntries,
			slotMachineEntries,
			totalEntries: allEntries.length
		};
	} catch (error) {
		if (process.env.NODE_ENV === 'development') {
			console.error('Error loading homepage data:', error);
		}
		return {
			featuredEntries: [],
			slotMachineEntries: [],
			totalEntries: 0
		};
	}
};
