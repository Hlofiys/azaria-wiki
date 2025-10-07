// Comprehensive lazy loading utilities
import { browser } from '$app/environment';

export interface LazyLoadOptions {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number | number[];
	timeout?: number;
}

export interface LazyComponentOptions extends LazyLoadOptions {
	fallback?: any;
	errorComponent?: any;
	preload?: boolean;
}

// Enhanced lazy loading with better performance
export class AdvancedLazyLoader {
	private static instance: AdvancedLazyLoader;
	private observers = new Map<string, IntersectionObserver>();
	private callbacks = new Map<Element, LazyLoadCallback>();
	private loadedElements = new Set<Element>();

	static getInstance(): AdvancedLazyLoader {
		if (!AdvancedLazyLoader.instance) {
			AdvancedLazyLoader.instance = new AdvancedLazyLoader();
		}
		return AdvancedLazyLoader.instance;
	}

	private constructor() {
		// Cleanup on page unload
		if (browser) {
			window.addEventListener('beforeunload', () => this.cleanup());
		}
	}

	// Create or get observer with specific options
	private getObserver(options: LazyLoadOptions = {}): IntersectionObserver {
		const key = JSON.stringify(options);
		
		if (this.observers.has(key)) {
			return this.observers.get(key)!;
		}

		if (!browser || !('IntersectionObserver' in window)) {
			// Fallback for environments without IntersectionObserver
			return {
				observe: () => {},
				unobserve: () => {},
				disconnect: () => {}
			} as any;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && !this.loadedElements.has(entry.target)) {
						const callback = this.callbacks.get(entry.target);
						if (callback) {
							callback.load();
							this.markAsLoaded(entry.target);
						}
					}
				});
			},
			{
				root: options.root || null,
				rootMargin: options.rootMargin || '50px',
				threshold: options.threshold || 0.1
			}
		);

		this.observers.set(key, observer);
		return observer;
	}

	// Observe element with callback
	observe(
		element: Element, 
		loadCallback: () => void, 
		options: LazyLoadOptions = {}
	): () => void {
		if (!browser) {
			// Server-side: execute immediately
			loadCallback();
			return () => {};
		}

		const observer = this.getObserver(options);
		const callback: LazyLoadCallback = { load: loadCallback };
		
		this.callbacks.set(element, callback);
		observer.observe(element);

		// Return cleanup function
		return () => {
			observer.unobserve(element);
			this.callbacks.delete(element);
			this.loadedElements.delete(element);
		};
	}

	// Mark element as loaded to prevent duplicate loading
	private markAsLoaded(element: Element): void {
		this.loadedElements.add(element);
		// Unobserve loaded elements to improve performance
		this.observers.forEach(observer => observer.unobserve(element));
		this.callbacks.delete(element);
	}

	// Preload element (load without waiting for intersection)
	preload(element: Element): void {
		const callback = this.callbacks.get(element);
		if (callback && !this.loadedElements.has(element)) {
			callback.load();
			this.markAsLoaded(element);
		}
	}

	// Check if element is already loaded
	isLoaded(element: Element): boolean {
		return this.loadedElements.has(element);
	}

	// Cleanup all observers
	cleanup(): void {
		this.observers.forEach(observer => observer.disconnect());
		this.observers.clear();
		this.callbacks.clear();
		this.loadedElements.clear();
	}

	// Get performance stats
	getStats() {
		return {
			observersCount: this.observers.size,
			pendingCallbacks: this.callbacks.size,
			loadedElements: this.loadedElements.size,
			isSupported: browser && 'IntersectionObserver' in window
		};
	}
}

interface LazyLoadCallback {
	load: () => void;
}

// Lazy component loader for Svelte components
export function createLazyComponent<T = any>(
	componentLoader: () => Promise<{ default: T }>,
	options: LazyComponentOptions = {}
) {
	let isLoading = false;
	let isLoaded = false;
	let component: T | null = null;
	let error: Error | null = null;
	let loadPromise: Promise<T> | null = null;

	const load = async (): Promise<T> => {
		if (isLoaded && component) {
			return component;
		}

		if (loadPromise) {
			return loadPromise;
		}

		isLoading = true;
		error = null;

		loadPromise = componentLoader()
			.then((module) => {
				component = module.default;
				isLoaded = true;
				isLoading = false;
				return component;
			})
			.catch((err) => {
				error = err;
				isLoading = false;
				throw err;
			});

		return loadPromise;
	};

	// Preload if specified
	if (options.preload && browser) {
		load().catch(() => {
			// Silently handle preload errors
		});
	}

	return {
		load,
		get isLoading() { return isLoading; },
		get isLoaded() { return isLoaded; },
		get component() { return component; },
		get error() { return error; }
	};
}

// Utility for lazy loading images with better performance
export class LazyImageLoader {
	private static instance: LazyImageLoader;
	private loader: AdvancedLazyLoader;
	private imageCache = new Map<string, HTMLImageElement>();

	static getInstance(): LazyImageLoader {
		if (!LazyImageLoader.instance) {
			LazyImageLoader.instance = new LazyImageLoader();
		}
		return LazyImageLoader.instance;
	}

	private constructor() {
		this.loader = AdvancedLazyLoader.getInstance();
	}

	// Load image with caching and error handling
	loadImage(
		element: HTMLImageElement,
		src: string,
		options: LazyLoadOptions & { placeholder?: string } = {}
	): () => void {
		// Check cache first
		if (this.imageCache.has(src)) {
			const cachedImg = this.imageCache.get(src)!;
			element.src = cachedImg.src;
			return () => {};
		}

		// Set placeholder if provided
		if (options.placeholder) {
			element.src = options.placeholder;
		}

		return this.loader.observe(
			element,
			() => this.loadImageAsync(element, src),
			options
		);
	}

	private async loadImageAsync(element: HTMLImageElement, src: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			
			img.onload = () => {
				// Cache the loaded image
				this.imageCache.set(src, img);
				// Apply to target element
				element.src = src;
				element.classList.add('loaded');
				resolve();
			};

			img.onerror = () => {
				element.classList.add('error');
				reject(new Error(`Failed to load image: ${src}`));
			};

			img.src = src;
		});
	}

	// Preload images for better UX
	preloadImages(sources: string[]): Promise<void[]> {
		return Promise.all(
			sources.map(src => {
				if (this.imageCache.has(src)) {
					return Promise.resolve();
				}

				return new Promise<void>((resolve, reject) => {
					const img = new Image();
					img.onload = () => {
						this.imageCache.set(src, img);
						resolve();
					};
					img.onerror = () => reject(new Error(`Failed to preload: ${src}`));
					img.src = src;
				});
			})
		);
	}

	// Clear image cache to free memory
	clearCache(): void {
		this.imageCache.clear();
	}

	getStats() {
		return {
			cachedImages: this.imageCache.size,
			...this.loader.getStats()
		};
	}
}