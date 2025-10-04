import { getRandomEntry } from '$lib/server/lore-parser';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export interface RandomArticleResponse {
	url: string;
	title: string;
	category: string;
}

export interface ErrorResponse {
	error: string;
}

export const GET: RequestHandler = async () => {
	try {
		const randomEntry = getRandomEntry();

		if (!randomEntry) {
			return json({ error: 'No entries found' } as ErrorResponse, { status: 404 });
		}

		return json({
			url: `/${randomEntry.category}/${randomEntry.slug}`,
			title: randomEntry.title,
			category: randomEntry.category
		} as RandomArticleResponse);
	} catch (error) {
		console.error('Error getting random article:', error);
		return json({ error: 'Internal server error' } as ErrorResponse, { status: 500 });
	}
};
