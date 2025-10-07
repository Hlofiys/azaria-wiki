// Build optimization utilities
import { browser } from '$app/environment';

export interface BuildOptimizationConfig {
	enableChunkPreloading: boolean;
	enableResourceHints: boolean;
	enableCriticalCSS: boolean;
	enablePerformanceMonitoring: boolean;
}

export class BuildOptimizer {
	private static instance: BuildOptimizer;
	private config: BuildOptimizationConfig;

	static getInstance(config: Partial<BuildOptimizationConfig> = {}): BuildOptimizer {
		if (!BuildOptimizer.instance) {
			BuildOptimizer.instance = new BuildOptimizer(config);
		}
		return BuildOptimizer.instance;
	}

	private constructor(config: Partial<BuildOptimizationConfig>) {
		this.config = {
			enableChunkPreloading: true,
			enableResourceHints: true,
			enableCriticalCSS: true,
			enablePerformanceMonitoring: true,
			...config
		};
	}

	// Initialize all optimizations
	async initializeOptimizations(): Promise<void> {
		if (!browser) return;

		const optimizations: Promise<void>[] = [];

		if (this.config.enableResourceHints) {
			optimizations.push(this.setupResourceHints());
		}

		if (this.config.enableChunkPreloading) {
			optimizations.push(this.setupChunkPreloading());
		}

		if (this.config.enableCriticalCSS) {
			optimizations.push(this.setupCriticalCSS());
		}

		if (this.config.enablePerformanceMonitoring) {
			optimizations.push(this.setupPerformanceMonitoring());
		}

		await Promise.all(optimizations);
	}

	private async setupResourceHints(): Promise<void> {
		try {
			const { ResourceHintsManager } = await import('../optimizations/critical-css.js');
			const resourceHints = ResourceHintsManager.getInstance();
			resourceHints.initializeCriticalHints();
		} catch (error) {
			console.debug('Resource hints setup failed:', error);
		}
	}

	private async setupChunkPreloading(): Promise<void> {
		try {
			const { ChunkPreloadManager } = await import('./chunk-optimizer.js');
			ChunkPreloadManager.getInstance();
		} catch (error) {
			console.debug('Chunk preloading setup failed:', error);
		}
	}

	private async setupCriticalCSS(): Promise<void> {
		try {
			const { CriticalCSSManager } = await import('../optimizations/critical-css.js');
			const criticalCSS = CriticalCSSManager.getInstance();
			
			// Delay critical CSS injection to avoid blocking initial render
			setTimeout(() => {
				criticalCSS.injectCriticalCSS();
			}, 100);
		} catch (error) {
			console.debug('Critical CSS setup failed:', error);
		}
	}

	private async setupPerformanceMonitoring(): Promise<void> {
		try {
			const { RealUserMonitoring } = await import('../optimizations/performance-monitor.js');
			const performanceMonitor = RealUserMonitoring.getInstance();
			
			// Send performance data periodically (in production only)
			if (process.env.NODE_ENV === 'production') {
				setInterval(() => {
					performanceMonitor.sendToAnalytics().catch(() => {});
				}, 5 * 60 * 1000); // Every 5 minutes
			}
		} catch (error) {
			console.debug('Performance monitoring setup failed:', error);
		}
	}

	// Get optimization status
	getOptimizationStatus() {
		return {
			config: this.config,
			browser: browser,
			timestamp: Date.now()
		};
	}

	// Disable specific optimizations (useful for debugging)
	disableOptimization(optimization: keyof BuildOptimizationConfig): void {
		this.config[optimization] = false;
	}

	// Enable specific optimizations
	enableOptimization(optimization: keyof BuildOptimizationConfig): void {
		this.config[optimization] = true;
	}
}

// Auto-initialize optimizations when imported
if (browser) {
	const optimizer = BuildOptimizer.getInstance();
	optimizer.initializeOptimizations().catch((error) => {
		console.debug('Build optimizations failed to initialize:', error);
	});
}