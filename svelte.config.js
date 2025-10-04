import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],
	kit: {
		adapter: adapter({
			// Default static adapter settings for better compatibility
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: false,
			strict: false  // Allow dynamic routes to be handled client-side
		}),
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore favicon.ico 404 errors
				if (path === '/favicon.ico') {
					return;
				}
				// Throw for other errors
				throw new Error(message);
			}
		}
	},
	extensions: ['.svelte', '.svx']
};

export default config;
