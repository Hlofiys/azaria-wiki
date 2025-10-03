import { getAllEntriesFlat } from '$lib/server/lore-parser.js';

export async function load() {
	try {
		const allEntries = getAllEntriesFlat();
		
		// Get featured entries (first few from each category)
		const featuredEntries = [];
		const categories = ['characters', 'locations', 'factions', 'artifacts', 'concepts', 'creatures'];
		
		categories.forEach(category => {
			const categoryEntries = allEntries.filter(entry => entry.category === category);
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
		console.error('Error loading homepage data:', error);
		return {
			featuredEntries: [],
			slotMachineEntries: [],
			totalEntries: 0
		};
	}
}