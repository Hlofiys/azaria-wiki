import { getAllEntries, getCategoryInfo } from '$lib/server/lore-parser.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { category } = params;
	
	// Validate category
	const validCategories = ['characters', 'locations', 'factions', 'artifacts', 'concepts', 'creatures'];
	if (!validCategories.includes(category)) {
		throw error(404, 'Category not found');
	}
	
	try {
		const entries = getAllEntries(category);
		const categoryInfo = getCategoryInfo(category);
		
		return {
			entries,
			categoryInfo,
			category
		};
	} catch (err) {
		console.error(`Error loading category ${category}:`, err);
		throw error(500, 'Failed to load entries');
	}
}