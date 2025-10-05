// Performance monitoring utilities for Azaria Wiki
import { browser } from '$app/environment';

export interface PerformanceMetrics {
	// Page load metrics
	pageLoadTime: number;
	domContentLoaded: number;
	firstContentfulPaint: number;
	largestContentfulPaint: number;

	// Search performance
	searchLatency: number;
	searchResultCount: number;

	// Cache performance
	cacheHitRate: number;
	cacheMissCount: number;

	// User interactions
	interactionToNextPaint: number;

	// Bundle size metrics
	jsSize: number;
	cssSize: number;
	totalSize: number;
}

class PerformanceMonitor {
	private metrics: Partial<PerformanceMetrics> = {};
	private searchTimes: number[] = [];
	private cacheHits = 0;
	private cacheMisses = 0;

	constructor() {
		if (!browser) return;

		this.initializeMetrics();
		this.setupObservers();
	}

	private initializeMetrics() {
		// Mark page load start
		performance.mark('page-load-start');

		// Listen for DOMContentLoaded
		if (document.readyState === 'loading') {
			document.addEventListener('DOMContentLoaded', () => {
				this.metrics.domContentLoaded = performance.now();
			});
		} else {
			this.metrics.domContentLoaded = 0; // Already loaded
		}

		// Page load complete
		window.addEventListener('load', () => {
			this.metrics.pageLoadTime = performance.now();
		});
	}

	private setupObservers() {
		if (!('PerformanceObserver' in window)) return;

		// First Contentful Paint
		const paintObserver = new PerformanceObserver((list) => {
			for (const entry of list.getEntries()) {
				if (entry.name === 'first-contentful-paint') {
					this.metrics.firstContentfulPaint = entry.startTime;
				}
			}
		});
		paintObserver.observe({ type: 'paint', buffered: true });

		// Largest Contentful Paint
		const lcpObserver = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const lastEntry = entries[entries.length - 1];
			this.metrics.largestContentfulPaint = lastEntry.startTime;
		});
		lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

		// Resource timing for bundle size analysis
		const resourceObserver = new PerformanceObserver((list) => {
			let jsSize = 0;
			let cssSize = 0;

			for (const entry of list.getEntries()) {
				const resource = entry as PerformanceResourceTiming;
				const size = resource.transferSize || 0;

				if (resource.name.includes('.js')) {
					jsSize += size;
				} else if (resource.name.includes('.css')) {
					cssSize += size;
				}
			}

			this.metrics.jsSize = jsSize;
			this.metrics.cssSize = cssSize;
			this.metrics.totalSize = jsSize + cssSize;
		});
		resourceObserver.observe({ type: 'resource', buffered: true });
	}

	// Track search performance
	trackSearchStart(): number {
		return performance.now();
	}

	trackSearchEnd(startTime: number, resultCount: number) {
		const duration = performance.now() - startTime;
		this.searchTimes.push(duration);
		this.metrics.searchLatency = this.getAverageSearchTime();
		this.metrics.searchResultCount = resultCount;
	}

	// Track cache performance
	trackCacheHit() {
		this.cacheHits++;
		this.updateCacheMetrics();
	}

	trackCacheMiss() {
		this.cacheMisses++;
		this.updateCacheMetrics();
	}

	private updateCacheMetrics() {
		const total = this.cacheHits + this.cacheMisses;
		this.metrics.cacheHitRate = total > 0 ? (this.cacheHits / total) * 100 : 0;
		this.metrics.cacheMissCount = this.cacheMisses;
	}

	private getAverageSearchTime(): number {
		if (this.searchTimes.length === 0) return 0;
		const sum = this.searchTimes.reduce((a, b) => a + b, 0);
		return sum / this.searchTimes.length;
	}

	// Get current metrics
	getMetrics(): Partial<PerformanceMetrics> {
		return { ...this.metrics };
	}

	// Get performance summary
	getSummary(): string {
		const m = this.metrics;
		return `
Performance Summary:
- Page Load: ${m.pageLoadTime?.toFixed(0)}ms
- FCP: ${m.firstContentfulPaint?.toFixed(0)}ms
- LCP: ${m.largestContentfulPaint?.toFixed(0)}ms
- Search Avg: ${m.searchLatency?.toFixed(0)}ms
- Cache Hit Rate: ${m.cacheHitRate?.toFixed(1)}%
- Bundle Size: ${((m.totalSize || 0) / 1024).toFixed(1)}KB
		`.trim();
	}

	// Log metrics to console (development only)
	logMetrics() {
		if (process.env.NODE_ENV === 'development') {
			console.log(this.getSummary());
		}
	}

	// Send metrics to analytics (placeholder)
	sendToAnalytics() {
		// In production, send to your analytics service
		// Example: analytics.track('performance', this.getMetrics());
	}
}

// Singleton instance
export const performanceMonitor = browser ? new PerformanceMonitor() : null;

// Utility functions
export function measureFunction<T>(fn: () => T, name: string): T {
	if (!browser) return fn();

	const start = performance.now();
	const result = fn();
	const end = performance.now();

	if (process.env.NODE_ENV === 'development') {
		console.log(`${name} took ${(end - start).toFixed(2)}ms`);
	}

	return result;
}

export async function measureAsyncFunction<T>(fn: () => Promise<T>, name: string): Promise<T> {
	if (!browser) return fn();

	const start = performance.now();
	const result = await fn();
	const end = performance.now();

	if (process.env.NODE_ENV === 'development') {
		console.log(`${name} took ${(end - start).toFixed(2)}ms`);
	}

	return result;
}

// Export types
export type { PerformanceMetrics };
