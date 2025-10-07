// Chunk optimization and preloading strategy
import { browser } from '$app/environment';

export interface ChunkPreloadStrategy {
	immediate: string[];
	hover: string[];
	idle: string[];
	route: Record<string, string[]>;
}

export class ChunkPreloadManager {
	private static instance: ChunkPreloadManager;
	private preloadedChunks = new Set<string>();
	private strategy: ChunkPreloadStrategy;

	static getInstance(): ChunkPreloadManager {
		if (!ChunkPreloadManager.instance) {
			ChunkPreloadManager.instance = new ChunkPreloadManager();
		}
		return ChunkPreloadManager.instance;
	}

	private constructor() {
		this.strategy = {
			immediate: [
				// Critical chunks that should load immediately
				'components',
				'utils'
			],
			hover: [
				// Chunks to preload on hover
				'lazy-components',
				'optimizations'
			],
			idle: [
				// Chunks to preload during idle time
				'performance',
				'icons'
			],
			route: {
				'/': ['lazy-components'],
				'/[category]': ['lazy-components', 'components'],
				'/[category]/[slug]': ['lazy-components', 'components'],
				'/search': ['components'],
				'/admin': ['optimizations', 'performance']
			}
		};

		if (browser) {
			this.initializePreloading();
		}
	}

	private initializePreloading(): void {
		// Preload immediate chunks
		this.preloadChunks(this.strategy.immediate);

		// Setup hover preloading
		this.setupHoverPreloading();

		// Preload idle chunks when browser is idle
		this.preloadIdleChunks();
	}

	private async preloadChunks(chunkNames: string[]): Promise<void> {
		const preloadPromises = chunkNames.map(chunkName => this.preloadChunk(chunkName));
		await Promise.all(preloadPromises);
	}

	private async preloadChunk(chunkName: string): Promise<void> {
		if (this.preloadedChunks.has(chunkName)) return;

		try {
			// Create modulepreload link for the chunk
			const link = document.createElement('link');
			link.rel = 'modulepreload';
			
			// We can't directly know the chunk filename, but we can preload the modules
			// that would be in that chunk based on our manual chunk configuration
			const moduleMap = this.getModuleMapForChunk(chunkName);
			
			if (moduleMap.length > 0) {
				// Preload the first module which should trigger chunk loading
				await import(moduleMap[0]).catch(() => {});
				this.preloadedChunks.add(chunkName);
			}
		} catch (error) {
			console.debug(`Failed to preload chunk ${chunkName}:`, error);
		}
	}

	private getModuleMapForChunk(chunkName: string): string[] {
		const moduleMap: Record<string, string[]> = {
			'components': [
				'../components/ui/LoreCard.svelte',
				'../components/ui/Infobox.svelte'
			],
			'lazy-components': [
				'../components/lazy/LazyLoreCard.svelte',
				'../components/lazy/LazyInfobox.svelte'
			],
			'optimizations': [
				'../optimizations/critical-css.js',
				'../optimizations/service-worker-cache.js'
			],
			'performance': [
				'../optimizations/performance-monitor.js'
			],
			'utils': [
				'./lazy-loader.js',
				'./performance-utils.js'
			]
		};

		return moduleMap[chunkName] || [];
	}

	private setupHoverPreloading(): void {
		let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

		document.addEventListener('mouseover', (event) => {
			const target = event.target as HTMLElement;
			const link = target.closest('a[href]') as HTMLAnchorElement;

			if (link && link.href) {
				if (hoverTimeout) clearTimeout(hoverTimeout);

				hoverTimeout = setTimeout(() => {
					this.preloadChunksForRoute(link.pathname);
				}, 150);
			}
		});

		document.addEventListener('mouseout', () => {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
			}
		});
	}

	private preloadIdleChunks(): void {
		if ('requestIdleCallback' in window) {
			window.requestIdleCallback(() => {
				this.preloadChunks(this.strategy.idle);
			}, { timeout: 5000 });
		} else {
			setTimeout(() => {
				this.preloadChunks(this.strategy.idle);
			}, 2000);
		}
	}

	private preloadChunksForRoute(pathname: string): void {
		// Find matching route pattern
		for (const [routePattern, chunks] of Object.entries(this.strategy.route)) {
			if (this.matchesRoute(pathname, routePattern)) {
				this.preloadChunks(chunks);
				break;
			}
		}
	}

	private matchesRoute(pathname: string, pattern: string): boolean {
		// Simple pattern matching for SvelteKit routes
		const patternRegex = pattern
			.replace(/\[([^\]]+)\]/g, '[^/]+') // Replace [param] with regex
			.replace(/\//g, '\\/'); // Escape slashes

		return new RegExp(`^${patternRegex}$`).test(pathname);
	}

	// Public API
	preloadForRoute(route: string): void {
		const chunks = this.strategy.route[route] || [];
		this.preloadChunks(chunks);
	}

	getPreloadedChunks(): string[] {
		return Array.from(this.preloadedChunks);
	}

	getStats() {
		return {
			preloadedChunks: this.preloadedChunks.size,
			strategy: this.strategy,
			preloadedChunkNames: Array.from(this.preloadedChunks)
		};
	}
}