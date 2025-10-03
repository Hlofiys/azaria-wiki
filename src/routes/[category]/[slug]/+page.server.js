import { getEntry, getBacklinks } from '$lib/server/lore-parser.js';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { category, slug } = params;
	
	try {
		const entry = getEntry(category, slug);
		
		if (!entry) {
			throw error(404, 'Entry not found');
		}
		
		const backlinks = getBacklinks(category, slug);
		
		return {
			entry,
			backlinks
		};
	} catch (err) {
		console.error(`Error loading entry ${category}/${slug}:`, err);
		throw error(404, 'Entry not found');
	}
}