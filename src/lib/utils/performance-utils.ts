// Performance utilities and optimizations
import { browser } from '$app/environment';

// Efficient debounce function
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number,
	immediate = false
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;
	
	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};
		
		const callNow = immediate && !timeout;
		
		if (timeout !== null) {
			clearTimeout(timeout);
		}
		
		timeout = setTimeout(later, wait);
		
		if (callNow) func(...args);
	};
}

// Efficient throttle function
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	limit: number
): (...args: Parameters<T>) => void {
	let inThrottle: boolean;
	
	return function executedFunction(...args: Parameters<T>) {
		if (!inThrottle) {
			func.apply(this, args);
			inThrottle = true;
			setTimeout(() => (inThrottle = false), limit);
		}
	};
}

// Efficient requestIdleCallback polyfill
export const requestIdleCallback = 
	(browser && 'requestIdleCallback' in window) 
		? window.requestIdleCallback.bind(window)
		: (callback: IdleRequestCallback, options?: IdleRequestOptions) => {
			const timeout = options?.timeout || 5000;
			return setTimeout(() => {
				const start = Date.now();
				callback({
					didTimeout: false,
					timeRemaining() {
						return Math.max(0, 50 - (Date.now() - start));
					}
				});
			}, 1);
		};

// Intersection Observer singleton for lazy loading
export class LazyLoader {
	private static instance: LazyLoader;
	private observer: IntersectionObserver | null = null;
	private callbacks = new Map<Element, () => void>();

	static getInstance(): LazyLoader {
		if (!LazyLoader.instance) {
			LazyLoader.instance = new LazyLoader();
		}
		return LazyLoader.instance;
	}

	private constructor() {
		if (browser && 'IntersectionObserver' in window) {
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const callback = this.callbacks.get(entry.target);
							if (callback) {
								callback();
								this.unobserve(entry.target);
							}
						}
					});
				},
				{
					rootMargin: '50px',
					threshold: 0.1
				}
			);
		}
	}

	observe(element: Element, callback: () => void): void {
		if (this.observer) {
			this.callbacks.set(element, callback);
			this.observer.observe(element);
		} else {
			// Fallback for environments without IntersectionObserver
			callback();
		}
	}

	unobserve(element: Element): void {
		if (this.observer) {
			this.observer.unobserve(element);
			this.callbacks.delete(element);
		}
	}

	disconnect(): void {
		if (this.observer) {
			this.observer.disconnect();
			this.callbacks.clear();
		}
	}
}

// Memory-efficient array operations
export function fastFilter<T>(array: T[], predicate: (item: T, index: number) => boolean): T[] {
	const result: T[] = [];
	for (let i = 0; i < array.length; i++) {
		if (predicate(array[i], i)) {
			result.push(array[i]);
		}
	}
	return result;
}

export function fastMap<T, U>(array: T[], mapper: (item: T, index: number) => U): U[] {
	const result: U[] = new Array(array.length);
	for (let i = 0; i < array.length; i++) {
		result[i] = mapper(array[i], i);
	}
	return result;
}

// Efficient object comparison for memoization
export function shallowEqual(obj1: any, obj2: any): boolean {
	if (obj1 === obj2) return true;
	
	if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
		return false;
	}
	
	const keys1 = Object.keys(obj1);
	const keys2 = Object.keys(obj2);
	
	if (keys1.length !== keys2.length) return false;
	
	for (const key of keys1) {
		if (obj1[key] !== obj2[key]) return false;
	}
	
	return true;
}

// Simple memoization function
export function memoize<T extends (...args: any[]) => any>(
	fn: T,
	getKey: (...args: Parameters<T>) => string = (...args) => JSON.stringify(args)
): T {
	const cache = new Map<string, ReturnType<T>>();
	
	return ((...args: Parameters<T>): ReturnType<T> => {
		const key = getKey(...args);
		
		if (cache.has(key)) {
			return cache.get(key)!;
		}
		
		const result = fn(...args);
		cache.set(key, result);
		
		// Prevent memory leaks by limiting cache size
		if (cache.size > 100) {
			const firstKey = cache.keys().next().value;
			cache.delete(firstKey);
		}
		
		return result;
	}) as T;
}