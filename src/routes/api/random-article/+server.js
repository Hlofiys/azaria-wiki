import { getRandomEntry } from '$lib/server/lore-parser.js';
import { json } from '@sveltejs/kit';

export async function GET() {
	try {
		const randomEntry = getRandomEntry();
		
		if (!randomEntry) {
			return json({ error: 'No entries found' }, { status: 404 });
		}
		
		return json({
			url: `/${randomEntry.category}/${randomEntry.slug}`,
			title: randomEntry.title,
			category: randomEntry.category
		});
	} catch (error) {
		console.error('Error getting random article:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}