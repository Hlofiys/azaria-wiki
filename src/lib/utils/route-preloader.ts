// Intelligent route preloading based on user behavior
import { browser } from '$app/environment';
import { createLazyComponent } from './lazy-loader';

interface RoutePreloadConfig {
	route: string;
	priority: number;
	dependencies?: string[];
	delay?: number;
}

export class RoutePreloader {
	private static instance: RoutePreloader;
	private preloadedRoutes = new Set<string>();
	private preloadPromises = new Map<string, Promise<any>>();
	private userBehaviorData = {
		visitedRoutes: new Set<string>(),
		routeTransitions: new Map<string, string[]>(), // from -> [to]
		dwellTimes: new Map<string, number>()
	};

	private routeConfigs: RoutePreloadConfig[] = [
		{ route: '/[category]', priority: 1, delay: 1000 },
		{ route: '/[category]/[slug]', priority: 2, delay: 1500 },
		{ route: '/search', priority: 3, delay: 2000 },
		{ route: '/admin', priority: 5, delay: 5000 }
	];

	static getInstance(): RoutePreloader {
		if (!RoutePreloader.instance) {
			RoutePreloader.instance = new RoutePreloader();
		}
		return RoutePreloader.instance;
	}

	private constructor() {
		if (browser) {
			this.initializeBehaviorTracking();
		}
	}

	private initializeBehaviorTracking(): void {
		// Track route visits
		let currentRoute = '';
		let routeStartTime = Date.now();

		const trackRouteChange = () => {
			const newRoute = window.location.pathname;
			const now = Date.now();

			if (currentRoute) {
				// Record dwell time
				const dwellTime = now - routeStartTime;
				this.userBehaviorData.dwellTimes.set(currentRoute, dwellTime);

				// Record transition
				if (!this.userBehaviorData.routeTransitions.has(currentRoute)) {
					this.userBehaviorData.routeTransitions.set(currentRoute, []);
				}
				this.userBehaviorData.routeTransitions.get(currentRoute)!.push(newRoute);
			}

			currentRoute = newRoute;
			routeStartTime = now;
			this.userBehaviorData.visitedRoutes.add(newRoute);

			// Trigger intelligent preloading
			this.intelligentPreload(newRoute);
		};

		// Listen for route changes
		window.addEventListener('popstate', trackRouteChange);
		
		// Track initial route
		trackRouteChange();

		// Track mouse movements for hover-based preloading
		this.setupHoverPreloading();
	}

	private setupHoverPreloading(): void {
		let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

		document.addEventListener('mouseover', (event) => {
			const target = event.target as HTMLElement;
			const link = target.closest('a[href]') as HTMLAnchorElement;

			if (link && link.href) {
				// Clear previous timeout
				if (hoverTimeout) {
					clearTimeout(hoverTimeout);
				}

				// Preload after hover delay
				hoverTimeout = setTimeout(() => {
					this.preloadRoute(link.href);
				}, 150); // 150ms hover delay
			}
		});

		document.addEventListener('mouseout', () => {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				hoverTimeout = null;
			}
		});
	}

	private intelligentPreload(currentRoute: string): void {
		// Get likely next routes based on behavior data
		const likelyRoutes = this.getPredictedRoutes(currentRoute);
		
		// Preload based on priority and likelihood
		likelyRoutes.forEach((route, index) => {
			const delay = index * 500; // Stagger preloading
			setTimeout(() => {
				this.preloadRoute(route);
			}, delay);
		});
	}

	private getPredictedRoutes(currentRoute: string): string[] {
		const predictions: Array<{ route: string; score: number }> = [];

		// Score based on historical transitions
		const transitions = this.userBehaviorData.routeTransitions.get(currentRoute) || [];
		const transitionCounts = new Map<string, number>();
		
		transitions.forEach(route => {
			transitionCounts.set(route, (transitionCounts.get(route) || 0) + 1);
		});

		// Add transition-based predictions
		transitionCounts.forEach((count, route) => {
			predictions.push({
				route,
				score: count / transitions.length * 100 // Percentage likelihood
			});
		});

		// Add default predictions based on route patterns
		const defaultPredictions = this.getDefaultPredictions(currentRoute);
		defaultPredictions.forEach(prediction => {
			const existing = predictions.find(p => p.route === prediction.route);
			if (existing) {
				existing.score += prediction.score;
			} else {
				predictions.push(prediction);
			}
		});

		// Sort by score and return top routes
		return predictions
			.sort((a, b) => b.score - a.score)
			.slice(0, 3)
			.map(p => p.route);
	}

	private getDefaultPredictions(currentRoute: string): Array<{ route: string; score: number }> {
		// Default patterns based on typical user flows
		const predictions: Array<{ route: string; score: number }> = [];

		if (currentRoute === '/') {
			predictions.push(
				{ route: '/characters', score: 30 },
				{ route: '/locations', score: 25 },
				{ route: '/search', score: 20 }
			);
		} else if (currentRoute.startsWith('/search')) {
			predictions.push(
				{ route: '/characters', score: 25 },
				{ route: '/locations', score: 25 },
				{ route: '/factions', score: 20 }
			);
		} else if (currentRoute.match(/^\/[^/]+$/)) {
			// Category page
			predictions.push(
				{ route: currentRoute + '/[slug]', score: 40 },
				{ route: '/search', score: 15 }
			);
		}

		return predictions;
	}

	async preloadRoute(route: string): Promise<void> {
		if (this.preloadedRoutes.has(route) || this.preloadPromises.has(route)) {
			return;
		}

		try {
			// Create preload promise
			const preloadPromise = this.loadRouteComponents(route);
			this.preloadPromises.set(route, preloadPromise);

			await preloadPromise;
			this.preloadedRoutes.add(route);
		} catch (error) {
			// Silently handle preload errors
			console.debug('Route preload failed:', route, error);
		} finally {
			this.preloadPromises.delete(route);
		}
	}

	private async loadRouteComponents(route: string): Promise<void> {
		const componentLoaders: Array<() => Promise<any>> = [];

		// Only preload reusable components, not route pages (to avoid static import conflicts)
		if (route.includes('/characters') || route.match(/^\/[^/]+$/)) {
			componentLoaders.push(
				() => import('../components/ui/LoreCard.svelte'),
				() => import('../components/lazy/LazyLoreCard.svelte')
			);
		}

		if (route.match(/^\/[^/]+\/[^/]+$/)) {
			componentLoaders.push(
				() => import('../components/ui/Infobox.svelte'),
				() => import('../components/lazy/LazyInfobox.svelte')
			);
		}

		if (route.includes('/search')) {
			componentLoaders.push(
				() => import('../components/ui/LoreCard.svelte')
			);
		}

		// Load components in parallel
		await Promise.all(componentLoaders.map(loader => loader().catch(() => {})));
	}

	// Public API for manual preloading
	preloadComponents(components: string[]): Promise<void[]> {
		const loaders = components.map(component => {
			switch (component) {
				case 'LoreCard':
					return import('../components/ui/LoreCard.svelte');
				case 'LazyLoreCard':
					return import('../components/lazy/LazyLoreCard.svelte');
				case 'Infobox':
					return import('../components/ui/Infobox.svelte');
				case 'LazyInfobox':
					return import('../components/lazy/LazyInfobox.svelte');
				case 'ImageViewer':
					return import('../components/ui/ImageViewer.svelte');
				case 'LazyImageViewer':
					return import('../components/lazy/LazyImageViewer.svelte');
				default:
					return Promise.resolve();
			}
		});

		return Promise.all(loaders.map(loader => loader.catch(() => {})));
	}

	// Get analytics data
	getAnalytics() {
		return {
			preloadedRoutes: Array.from(this.preloadedRoutes),
			visitedRoutes: Array.from(this.userBehaviorData.visitedRoutes),
			routeTransitions: Object.fromEntries(this.userBehaviorData.routeTransitions),
			averageDwellTime: this.calculateAverageDwellTime(),
			preloadHitRate: this.calculatePreloadHitRate()
		};
	}

	private calculateAverageDwellTime(): number {
		const times = Array.from(this.userBehaviorData.dwellTimes.values());
		return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
	}

	private calculatePreloadHitRate(): number {
		const visited = this.userBehaviorData.visitedRoutes;
		const preloaded = this.preloadedRoutes;
		const hits = Array.from(visited).filter(route => preloaded.has(route));
		return visited.size > 0 ? hits.length / visited.size : 0;
	}
}