// Client-side performance hooks
import { browser } from '$app/environment';
// Performance monitoring
const performanceMetrics = {
	pageLoadStart: 0,
	firstContentfulPaint: 0,
	largestContentfulPaint: 0,
	interactionToNextPaint: 0
};

// Initialize performance monitoring
if (browser) {
	// Track page load performance
	performance.mark('page-load-start');
	performanceMetrics.pageLoadStart = performance.now();

	// Web Vitals monitoring
	if ('PerformanceObserver' in window) {
		// Largest Contentful Paint
		const lcpObserver = new PerformanceObserver((entryList) => {
			const entries = entryList.getEntries();
			const lastEntry = entries[entries.length - 1];
			performanceMetrics.largestContentfulPaint = lastEntry.startTime;
		});
		lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

		// First Contentful Paint
		const fcpObserver = new PerformanceObserver((entryList) => {
			const entries = entryList.getEntries();
			const lastEntry = entries[entries.length - 1];
			performanceMetrics.firstContentfulPaint = lastEntry.startTime;
		});
		fcpObserver.observe({ type: 'paint', buffered: true });

		// Interaction to Next Paint (experimental)
		const inpObserver = new PerformanceObserver((entryList) => {
			const entries = entryList.getEntries();
			entries.forEach((entry) => {
				if (entry.processingStart && entry.startTime) {
					const inp = entry.processingStart - entry.startTime;
					performanceMetrics.interactionToNextPaint = Math.max(
						performanceMetrics.interactionToNextPaint,
						inp
					);
				}
			});
		});
		inpObserver.observe({ type: 'event', buffered: true });
	}

	// Resource loading optimization
	const preloadCriticalResources = () => {
		// Preload critical images
		const criticalImages = [
			'/favicon.svg'
			// Add other critical images here
		];

		criticalImages.forEach((src) => {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = src;
			document.head.appendChild(link);
		});
	};

	// Font loading optimization
	const optimizeFontLoading = () => {
		if ('fonts' in document) {
			// Preload critical fonts
			document.fonts.load('400 16px Lora').then(() => {
				document.documentElement.classList.add('fonts-loaded');
			});

			document.fonts.load('700 24px "Cinzel Decorative"').then(() => {
				document.documentElement.classList.add('heading-fonts-loaded');
			});
		}
	};

	// Icon loading optimization
	const optimizeIconLoading = () => {
		// Preload common iconify icons
		if (window.Iconify) {
			const commonIcons = [
				'mdi:crown',
				'mdi:castle',
				'mdi:sword-cross',
				'mdi:star-circle',
				'mdi:target',
				'game-icons:sea-dragon',
				'mdi:magnify',
				'mdi:home',
				'mdi:star'
			];

			// Load icons in batches to avoid overwhelming the API
			const batchSize = 3;
			for (let i = 0; i < commonIcons.length; i += batchSize) {
				const batch = commonIcons.slice(i, i + batchSize);
				window.Iconify.preloadIcons(batch);
			}
		}
	};

	// Initialize optimizations
	document.addEventListener('DOMContentLoaded', () => {
		preloadCriticalResources();
		optimizeFontLoading();
		optimizeIconLoading();
	});

	// Intersection Observer for lazy loading
	const setupLazyLoading = () => {
		if ('IntersectionObserver' in window) {
			const lazyImageObserver = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							const img = entry.target as HTMLImageElement;
							const src = img.dataset.src;
							if (src) {
								img.src = src;
								img.removeAttribute('data-src');
								lazyImageObserver.unobserve(img);
							}
						}
					});
				},
				{
					rootMargin: '50px'
				}
			);

			// Observe all images with data-src
			document.querySelectorAll('img[data-src]').forEach((img) => {
				lazyImageObserver.observe(img);
			});
		}
	};

	// Initialize after DOM is ready
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			setupLazyLoading();
			// Service worker registration is handled by PWAManager component
		});
	} else {
		setupLazyLoading();
		// Service worker registration is handled by PWAManager component
	}
}

// Export performance utilities
export const performanceUtils = {
	getMetrics: () => performanceMetrics,
	markInteraction: (name: string) => {
		if (browser && performance.mark) {
			performance.mark(`interaction-${name}`);
		}
	},
	measureRoute: (route: string) => {
		if (browser && performance.measure) {
			performance.measure(`route-${route}`, 'page-load-start');
		}
	}
};

// Global error handling for performance
if (browser) {
	window.addEventListener('error', (event) => {
		console.warn('Runtime error:', event.error);
	});

	window.addEventListener('unhandledrejection', (event) => {
		console.warn('Unhandled promise rejection:', event.reason);
	});
}
