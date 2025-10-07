import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Optimized preprocessors
	preprocess: [
		vitePreprocess(),
		mdsvex({
			// Optimize markdown processing
			extensions: ['.svx'],
			highlight: false, // Disable syntax highlighting for faster builds
			layout: false // Disable layout processing for performance
		})
	],

	kit: {
		adapter: adapter({
			// Optimized static adapter settings
			pages: 'build',
			assets: 'build',
			fallback: null,
			precompress: true, // Enable precompression for better performance
			strict: false
		}),

		// Enhanced prerender configuration
		prerender: {
			handleHttpError: ({ path, message }) => {
				// Ignore favicon.ico 404 errors
				if (path === '/favicon.ico') {
					return;
				}
				// Throw for other errors
				throw new Error(message);
			},
			// Handle unseen routes (dynamic routes that aren't discovered during crawling)
			handleUnseenRoutes: 'ignore', // Changed from 'warn' to 'ignore' for cleaner builds
			// Optimize prerendering
			handleMissingId: 'warn',
			handleEntryGeneratorMismatch: 'warn',
			// Concurrency for faster builds
			concurrency: 10,
			// Specify which routes to prerender explicitly
			entries: [
				'*', // Prerender all discoverable routes
				// Note: [category]/[slug] routes are dynamic and will be generated at runtime
			]
		},

		// Service worker for caching
		serviceWorker: {
			register: true,
			files: (filepath) => !/\.DS_Store/.test(filepath)
		},

		// Optimize client-side routing
		csp: {
			mode: 'auto',
			directives: {
				'script-src': [
					'self',
					'unsafe-inline',
					'https://identity.netlify.com',
					'https://api.iconify.design'
				],
				'style-src': ['self', 'unsafe-inline', 'https://fonts.googleapis.com'],
				'font-src': ['self', 'https://fonts.gstatic.com'],
				'img-src': ['self', 'data:', 'https:'],
				'connect-src': ['self', 'https://api.iconify.design']
			}
		},

		// Optimize paths
		paths: {
			assets: '',
			base: '',
			relative: true
		}
	},

	extensions: ['.svelte', '.svx'],

	// Svelte compiler optimizations
	compilerOptions: {
		// Enable dev mode optimizations in development
		dev: process.env.NODE_ENV === 'development',
		// Use compatibility API instead of legacy
		compatibility: {
			componentApi: 4
		}
	}
};

export default config;
