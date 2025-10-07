// Advanced service worker caching for components and data
import { browser } from '$app/environment';

export interface CacheConfig {
	componentCacheName: string;
	dataCacheName: string;
	maxAge: number;
	maxEntries: number;
	updateStrategy: 'cache-first' | 'network-first' | 'stale-while-revalidate';
}

export class ServiceWorkerCacheManager {
	private static instance: ServiceWorkerCacheManager;
	private config: CacheConfig;
	private registration: ServiceWorkerRegistration | null = null;

	static getInstance(config: Partial<CacheConfig> = {}): ServiceWorkerCacheManager {
		if (!ServiceWorkerCacheManager.instance) {
			ServiceWorkerCacheManager.instance = new ServiceWorkerCacheManager(config);
		}
		return ServiceWorkerCacheManager.instance;
	}

	private constructor(config: Partial<CacheConfig>) {
		this.config = {
			componentCacheName: 'azaria-components-v1',
			dataCacheName: 'azaria-data-v1',
			maxAge: 24 * 60 * 60 * 1000, // 24 hours
			maxEntries: 100,
			updateStrategy: 'stale-while-revalidate',
			...config
		};

		if (browser) {
			this.initializeServiceWorker();
		}
	}

	private async initializeServiceWorker(): Promise<void> {
		if ('serviceWorker' in navigator) {
			try {
				this.registration = await navigator.serviceWorker.register('/sw.js');
				console.log('SW registered:', this.registration);
				
				// Listen for service worker updates
				this.registration.addEventListener('updatefound', () => {
					this.handleServiceWorkerUpdate();
				});

				// Initialize caching strategies
				await this.setupCachingStrategies();
			} catch (error) {
				console.error('SW registration failed:', error);
			}
		}
	}

	private handleServiceWorkerUpdate(): void {
		const newWorker = this.registration?.installing;
		if (newWorker) {
			newWorker.addEventListener('statechange', () => {
				if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
					// New update available
					this.notifyUpdate();
				}
			});
		}
	}

	private notifyUpdate(): void {
		// Dispatch custom event for update notification
		window.dispatchEvent(new CustomEvent('sw-update-available'));
	}

	private async setupCachingStrategies(): Promise<void> {
		// Send cache configuration to service worker
		if (this.registration?.active) {
			this.registration.active.postMessage({
				type: 'CACHE_CONFIG',
				config: this.config
			});
		}
	}

	// Cache lazy-loaded components
	async cacheComponent(componentName: string, componentModule: any): Promise<void> {
		if (!browser || !('caches' in window)) return;

		try {
			const cache = await caches.open(this.config.componentCacheName);
			const componentData = {
				name: componentName,
				module: componentModule,
				timestamp: Date.now()
			};

			const response = new Response(JSON.stringify(componentData), {
				headers: { 'Content-Type': 'application/json' }
			});

			await cache.put(`/components/${componentName}`, response);
		} catch (error) {
			console.error('Failed to cache component:', error);
		}
	}

	// Retrieve cached component
	async getCachedComponent(componentName: string): Promise<any | null> {
		if (!browser || !('caches' in window)) return null;

		try {
			const cache = await caches.open(this.config.componentCacheName);
			const response = await cache.match(`/components/${componentName}`);
			
			if (response) {
				const data = await response.json();
				
				// Check if cache is still valid
				if (Date.now() - data.timestamp < this.config.maxAge) {
					return data.module;
				} else {
					// Remove expired cache
					await cache.delete(`/components/${componentName}`);
				}
			}
		} catch (error) {
			console.error('Failed to retrieve cached component:', error);
		}

		return null;
	}

	// Cache data responses
	async cacheData(url: string, data: any): Promise<void> {
		if (!browser || !('caches' in window)) return;

		try {
			const cache = await caches.open(this.config.dataCacheName);
			const response = new Response(JSON.stringify({
				data,
				timestamp: Date.now()
			}), {
				headers: { 'Content-Type': 'application/json' }
			});

			await cache.put(url, response);
		} catch (error) {
			console.error('Failed to cache data:', error);
		}
	}

	// Get cached data
	async getCachedData(url: string): Promise<any | null> {
		if (!browser || !('caches' in window)) return null;

		try {
			const cache = await caches.open(this.config.dataCacheName);
			const response = await cache.match(url);
			
			if (response) {
				const cached = await response.json();
				
				if (Date.now() - cached.timestamp < this.config.maxAge) {
					return cached.data;
				} else {
					await cache.delete(url);
				}
			}
		} catch (error) {
			console.error('Failed to retrieve cached data:', error);
		}

		return null;
	}

	// Clear expired caches
	async cleanupCaches(): Promise<void> {
		if (!browser || !('caches' in window)) return;

		try {
			const cacheNames = await caches.keys();
			
			for (const cacheName of cacheNames) {
				const cache = await caches.open(cacheName);
				const requests = await cache.keys();
				
				for (const request of requests) {
					const response = await cache.match(request);
					if (response) {
						try {
							const data = await response.json();
							if (Date.now() - data.timestamp > this.config.maxAge) {
								await cache.delete(request);
							}
						} catch {
							// If we can't parse the response, it might be a regular response
							// Check headers for age instead
							const date = response.headers.get('date');
							if (date) {
								const responseTime = new Date(date).getTime();
								if (Date.now() - responseTime > this.config.maxAge) {
									await cache.delete(request);
								}
							}
						}
					}
				}
			}
		} catch (error) {
			console.error('Cache cleanup failed:', error);
		}
	}

	// Force service worker update
	async updateServiceWorker(): Promise<void> {
		if (this.registration) {
			await this.registration.update();
		}
	}

	// Get cache statistics
	async getCacheStats(): Promise<any> {
		if (!browser || !('caches' in window)) return {};

		try {
			const stats: any = {};
			const cacheNames = await caches.keys();
			
			for (const cacheName of cacheNames) {
				const cache = await caches.open(cacheName);
				const requests = await cache.keys();
				stats[cacheName] = {
					entries: requests.length,
					requests: requests.map(req => req.url)
				};
			}
			
			return stats;
		} catch (error) {
			console.error('Failed to get cache stats:', error);
			return {};
		}
	}
}

// Enhanced lazy component loader with caching
export async function loadComponentWithCache(
	componentName: string,
	importFunction: () => Promise<any>
): Promise<any> {
	const cacheManager = ServiceWorkerCacheManager.getInstance();
	
	// Try to get from cache first
	const cached = await cacheManager.getCachedComponent(componentName);
	if (cached) {
		return cached;
	}
	
	// Load component and cache it
	try {
		const componentModule = await importFunction();
		await cacheManager.cacheComponent(componentName, componentModule);
		return componentModule;
	} catch (error) {
		console.error(`Failed to load component ${componentName}:`, error);
		throw error;
	}
}