import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		SvelteKitPWA({
			srcDir: './src',
			mode: 'production',
			strategies: 'generateSW',
			scope: '/',
			base: '/',
			selfDestroying: process.env.NODE_ENV === 'development',
			manifest: {
				name: 'Азария Вики — Медивал-деп-панк вселенная',
				short_name: 'Азария Вики',
				description:
					'Исследуйте мир Азарии - уникальную медивал-деп-панк вселенную, где средневековье встречается с философией азарта и удачи.',
				theme_color: '#c9a876',
				background_color: '#1a1a1a',
				display: 'standalone',
				orientation: 'portrait-primary',
				scope: '/',
				start_url: '/',
				lang: 'ru',
				categories: ['entertainment', 'reference', 'games'],
				icons: [
					{
						src: '/favicon.svg',
						sizes: 'any',
						type: 'image/svg+xml',
						purpose: 'any maskable'
					},
					{
						src: '/pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png'
					},
					{
						src: '/pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png'
					}
				],
				shortcuts: [
					{
						name: 'Поиск',
						short_name: 'Поиск',
						description: 'Поиск по статьям вики',
						url: '/search',
						icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
					},
					{
						name: 'Персонажи',
						short_name: 'Персонажи',
						description: 'Изучить персонажей мира Азарии',
						url: '/characters',
						icons: [{ src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
					}
				]
			},
			workbox: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,txt}'],
				navigateFallback: null,
				runtimeCaching: [
					{
						urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'google-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					},
					{
						urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'gstatic-fonts-cache',
							expiration: {
								maxEntries: 10,
								maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
							}
						}
					},
					{
						urlPattern: /^https:\/\/api\.iconify\.design\/.*/i,
						handler: 'CacheFirst',
						options: {
							cacheName: 'iconify-cache',
							expiration: {
								maxEntries: 50,
								maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
							}
						}
					}
				]
			},
			devOptions: {
				enabled: false,
				suppressWarnings: true,
				navigateFallback: '/',
				navigateFallbackAllowlist: [/^\/$/],
				type: 'module'
			}
		})
	],

	// Performance optimizations
	build: {
		// Use esbuild for minification (6x faster than Terser, handles ES modules)
		minify: 'esbuild',

		// Enable code splitting for better caching
		rollupOptions: {
			output: {
				// Optimize chunk splitting
				manualChunks: (id) => {
					// Group node_modules into vendor chunk
					if (id.includes('node_modules')) {
						if (id.includes('@iconify')) return 'icons';
						if (id.includes('daisyui') || id.includes('tailwind')) return 'ui';
						if (id.includes('marked') || id.includes('yaml')) return 'content';
						if (id.includes('svelte')) return 'framework';
						return 'vendor';
					}
					
					// Group app code by feature - avoid conflicts with SvelteKit's static imports
					if (id.includes('/lib/components/lazy/')) return 'lazy-components';
					if (id.includes('/lib/components/')) return 'components';
					if (id.includes('/lib/optimizations/')) return 'performance'; // Merge with performance chunk
					if (id.includes('/lib/utils/') && !id.includes('route-preloader')) return 'utils';
					if (id.includes('/lib/server/')) return 'server';
					if (id.includes('/lib/cache/') || id.includes('/lib/performance/')) return 'performance';
					
					// Don't chunk route pages - let SvelteKit handle them
					// This prevents the dynamic import warnings
				}
			}
		},

		// ESBuild options for aggressive optimization
		target: 'es2020',

		// Source maps for production debugging
		sourcemap: false,
		// Enable CSS code splitting
		cssCodeSplit: true,
		// Optimize chunk size
		chunkSizeWarningLimit: 1000
	},

	// Optimize dependencies
	optimizeDeps: {
		include: ['@iconify/svelte', 'marked', 'yaml', 'daisyui'],
		// Pre-bundle these for faster dev
		force: true
	},

	// Server configuration for development
	server: {
		// Enable compression in dev
		middlewareMode: false,
		// Allow external hosts
		host: true,
		allowedHosts: ['work-1-mxkolbgchykermep.prod-runtime.all-hands.dev'],
		// Optimize HMR
		hmr: {
			overlay: false
		}
	},

	// Enable experimental features for better performance
	experimental: {
		// Enable render optimization
		renderBuiltUrl: (filename) => {
			// Use CDN for static assets if needed
			return `/${filename}`;
		}
	}
});
