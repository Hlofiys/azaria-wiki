// Real User Monitoring (RUM) and Core Web Vitals tracking
import { browser } from '$app/environment';

export interface PerformanceMetric {
	name: string;
	value: number;
	timestamp: number;
	url: string;
	rating: 'good' | 'needs-improvement' | 'poor';
}

export interface CoreWebVitals {
	LCP?: PerformanceMetric; // Largest Contentful Paint
	FID?: PerformanceMetric; // First Input Delay
	CLS?: PerformanceMetric; // Cumulative Layout Shift
	TTFB?: PerformanceMetric; // Time to First Byte
	FCP?: PerformanceMetric; // First Contentful Paint
}

export class RealUserMonitoring {
	private static instance: RealUserMonitoring;
	private metrics: PerformanceMetric[] = [];
	private coreWebVitals: CoreWebVitals = {};
	private observer?: PerformanceObserver;
	private navigationStartTime: number = 0;

	static getInstance(): RealUserMonitoring {
		if (!RealUserMonitoring.instance) {
			RealUserMonitoring.instance = new RealUserMonitoring();
		}
		return RealUserMonitoring.instance;
	}

	private constructor() {
		if (browser) {
			this.navigationStartTime = performance.timeOrigin + performance.now();
			this.initializeObservers();
			this.trackRouteChanges();
		}
	}

	private initializeObservers(): void {
		// Observe paint and navigation entries
		if ('PerformanceObserver' in window) {
			this.observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry) => {
					this.processPerformanceEntry(entry);
				});
			});

			// Observe different types of performance entries
			try {
				this.observer.observe({ entryTypes: ['paint', 'navigation', 'largest-contentful-paint'] });
			} catch (e) {
				// Fallback for older browsers
				this.observer.observe({ entryTypes: ['paint', 'navigation'] });
			}
		}

		// Track Core Web Vitals using web-vitals library patterns
		this.trackLCP();
		this.trackFID();
		this.trackCLS();
		this.trackTTFB();
	}

	private processPerformanceEntry(entry: PerformanceEntry): void {
		const metric: PerformanceMetric = {
			name: entry.name,
			value: entry.startTime,
			timestamp: Date.now(),
			url: window.location.href,
			rating: this.getRating(entry.name, entry.startTime)
		};

		this.metrics.push(metric);

		// Limit stored metrics to prevent memory issues
		if (this.metrics.length > 1000) {
			this.metrics.shift();
		}
	}

	private trackLCP(): void {
		if ('PerformanceObserver' in window) {
			const observer = new PerformanceObserver((list) => {
				const entries = list.getEntries();
				const lastEntry = entries[entries.length - 1] as any;
				
				if (lastEntry) {
					this.coreWebVitals.LCP = {
						name: 'LCP',
						value: lastEntry.startTime,
						timestamp: Date.now(),
						url: window.location.href,
						rating: this.getRating('LCP', lastEntry.startTime)
					};
				}
			});

			try {
				observer.observe({ entryTypes: ['largest-contentful-paint'] });
			} catch (e) {
				// Browser doesn't support LCP
			}
		}
	}

	private trackFID(): void {
		if ('PerformanceObserver' in window) {
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry: any) => {
					if (entry.name === 'first-input') {
						this.coreWebVitals.FID = {
							name: 'FID',
							value: entry.processingStart - entry.startTime,
							timestamp: Date.now(),
							url: window.location.href,
							rating: this.getRating('FID', entry.processingStart - entry.startTime)
						};
					}
				});
			});

			try {
				observer.observe({ entryTypes: ['first-input'] });
			} catch (e) {
				// Fallback: track first interaction manually
				this.trackFirstInteraction();
			}
		}
	}

	private trackFirstInteraction(): void {
		let firstInteractionTime: number | null = null;

		const trackInteraction = (event: Event) => {
			if (firstInteractionTime === null) {
				firstInteractionTime = performance.now();
				
				this.coreWebVitals.FID = {
					name: 'FID',
					value: firstInteractionTime,
					timestamp: Date.now(),
					url: window.location.href,
					rating: this.getRating('FID', firstInteractionTime)
				};

				// Remove listeners after first interaction
				['click', 'keydown', 'touchstart'].forEach(type => {
					document.removeEventListener(type, trackInteraction, true);
				});
			}
		};

		['click', 'keydown', 'touchstart'].forEach(type => {
			document.addEventListener(type, trackInteraction, true);
		});
	}

	private trackCLS(): void {
		let clsValue = 0;
		let sessionValue = 0;
		let sessionEntries: any[] = [];

		if ('PerformanceObserver' in window) {
			const observer = new PerformanceObserver((list) => {
				list.getEntries().forEach((entry: any) => {
					if (!entry.hadRecentInput) {
						const firstSessionEntry = sessionEntries[0];
						const lastSessionEntry = sessionEntries[sessionEntries.length - 1];

						if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 &&
							entry.startTime - firstSessionEntry.startTime < 5000) {
							sessionValue += entry.value;
							sessionEntries.push(entry);
						} else {
							sessionValue = entry.value;
							sessionEntries = [entry];
						}

						if (sessionValue > clsValue) {
							clsValue = sessionValue;
							this.coreWebVitals.CLS = {
								name: 'CLS',
								value: clsValue,
								timestamp: Date.now(),
								url: window.location.href,
								rating: this.getRating('CLS', clsValue)
							};
						}
					}
				});
			});

			try {
				observer.observe({ entryTypes: ['layout-shift'] });
			} catch (e) {
				// Browser doesn't support layout-shift
			}
		}
	}

	private trackTTFB(): void {
		const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
		if (navigation) {
			const ttfb = navigation.responseStart - navigation.fetchStart;
			this.coreWebVitals.TTFB = {
				name: 'TTFB',
				value: ttfb,
				timestamp: Date.now(),
				url: window.location.href,
				rating: this.getRating('TTFB', ttfb)
			};
		}
	}

	private trackRouteChanges(): void {
		// Track SPA route changes
		let currentPath = window.location.pathname;
		
		const checkRouteChange = () => {
			const newPath = window.location.pathname;
			if (newPath !== currentPath) {
				this.onRouteChange(currentPath, newPath);
				currentPath = newPath;
			}
		};

		// Listen for popstate (back/forward)
		window.addEventListener('popstate', checkRouteChange);

		// Override pushState and replaceState to catch programmatic navigation
		const originalPushState = history.pushState;
		const originalReplaceState = history.replaceState;

		history.pushState = function(...args) {
			originalPushState.apply(history, args);
			setTimeout(checkRouteChange, 0);
		};

		history.replaceState = function(...args) {
			originalReplaceState.apply(history, args);
			setTimeout(checkRouteChange, 0);
		};
	}

	private onRouteChange(from: string, to: string): void {
		// Track route transition time
		const transitionStart = performance.now();
		
		// Use requestAnimationFrame to measure when route is rendered
		requestAnimationFrame(() => {
			const transitionTime = performance.now() - transitionStart;
			
			this.addMetric({
				name: 'Route Transition',
				value: transitionTime,
				timestamp: Date.now(),
				url: to,
				rating: this.getRating('Route Transition', transitionTime)
			});
		});
	}

	private getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
		const thresholds: Record<string, { good: number; poor: number }> = {
			'LCP': { good: 2500, poor: 4000 },
			'FID': { good: 100, poor: 300 },
			'CLS': { good: 0.1, poor: 0.25 },
			'TTFB': { good: 800, poor: 1800 },
			'Route Transition': { good: 200, poor: 500 }
		};

		const threshold = thresholds[metricName];
		if (!threshold) return 'good';

		if (value <= threshold.good) return 'good';
		if (value <= threshold.poor) return 'needs-improvement';
		return 'poor';
	}

	// Public API
	addMetric(metric: PerformanceMetric): void {
		this.metrics.push(metric);
	}

	getMetrics(): PerformanceMetric[] {
		return [...this.metrics];
	}

	getCoreWebVitals(): CoreWebVitals {
		return { ...this.coreWebVitals };
	}

	// Generate performance report
	generateReport(): any {
		const now = Date.now();
		const last24h = this.metrics.filter(m => now - m.timestamp < 24 * 60 * 60 * 1000);
		
		const report = {
			coreWebVitals: this.coreWebVitals,
			totalMetrics: this.metrics.length,
			last24hMetrics: last24h.length,
			performanceScore: this.calculatePerformanceScore(),
			recommendations: this.generateRecommendations(),
			timestamp: now
		};

		return report;
	}

	private calculatePerformanceScore(): number {
		const vitals = this.coreWebVitals;
		let score = 100;
		let penalties = 0;

		// Penalize poor Core Web Vitals
		Object.values(vitals).forEach(vital => {
			if (vital?.rating === 'poor') penalties += 20;
			else if (vital?.rating === 'needs-improvement') penalties += 10;
		});

		return Math.max(0, score - penalties);
	}

	private generateRecommendations(): string[] {
		const recommendations: string[] = [];
		const vitals = this.coreWebVitals;

		if (vitals.LCP?.rating === 'poor') {
			recommendations.push('Optimize Largest Contentful Paint: Consider lazy loading, image optimization, or reducing render-blocking resources');
		}

		if (vitals.FID?.rating === 'poor') {
			recommendations.push('Improve First Input Delay: Reduce JavaScript execution time and consider code splitting');
		}

		if (vitals.CLS?.rating === 'poor') {
			recommendations.push('Fix Cumulative Layout Shift: Set dimensions for images and reserve space for dynamic content');
		}

		if (vitals.TTFB?.rating === 'poor') {
			recommendations.push('Optimize Time to First Byte: Improve server response time or use a CDN');
		}

		return recommendations;
	}

	// Send metrics to analytics service (placeholder)
	async sendToAnalytics(): Promise<void> {
		const report = this.generateReport();
		
		// In production, send to your analytics service
		console.log('Performance Report:', report);
		
		// Example: send to analytics endpoint
		// await fetch('/api/analytics/performance', {
		//   method: 'POST',
		//   headers: { 'Content-Type': 'application/json' },
		//   body: JSON.stringify(report)
		// });
	}

	// Cleanup
	disconnect(): void {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}