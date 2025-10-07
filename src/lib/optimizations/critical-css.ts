// Critical CSS extraction and optimization
import { browser } from '$app/environment';

export interface CriticalCSSConfig {
	extractAboveFold?: boolean;
	inlineThreshold?: number;
	deferNonCritical?: boolean;
	preloadFonts?: boolean;
}

export class CriticalCSSManager {
	private static instance: CriticalCSSManager;
	private criticalStyles = new Set<string>();
	private deferredStyles = new Set<string>();
	private config: CriticalCSSConfig;

	static getInstance(config: CriticalCSSConfig = {}): CriticalCSSManager {
		if (!CriticalCSSManager.instance) {
			CriticalCSSManager.instance = new CriticalCSSManager(config);
		}
		return CriticalCSSManager.instance;
	}

	private constructor(config: CriticalCSSConfig) {
		this.config = {
			extractAboveFold: true,
			inlineThreshold: 14000, // 14KB threshold for inlining
			deferNonCritical: true,
			preloadFonts: true,
			...config
		};

		if (browser) {
			this.initializeCriticalCSS();
		}
	}

	private initializeCriticalCSS(): void {
		// Extract above-the-fold styles
		if (this.config.extractAboveFold) {
			this.extractAboveFoldStyles();
		}

		// Defer non-critical styles
		if (this.config.deferNonCritical) {
			this.deferNonCriticalStyles();
		}

		// Preload fonts
		if (this.config.preloadFonts) {
			this.preloadCriticalFonts();
		}
	}

	private extractAboveFoldStyles(): void {
		const viewportHeight = window.innerHeight;
		const criticalElements = this.getAboveFoldElements(viewportHeight);
		
		criticalElements.forEach(element => {
			const styles = window.getComputedStyle(element);
			this.extractElementStyles(element, styles);
		});
	}

	private getAboveFoldElements(viewportHeight: number): Element[] {
		const allElements = document.querySelectorAll('*');
		const criticalElements: Element[] = [];

		allElements.forEach(element => {
			const rect = element.getBoundingClientRect();
			if (rect.top < viewportHeight && rect.bottom > 0) {
				criticalElements.push(element);
			}
		});

		return criticalElements;
	}

	private extractElementStyles(element: Element, computedStyles: CSSStyleDeclaration): void {
		// Extract critical CSS properties
		const criticalProperties = [
			'display', 'position', 'top', 'left', 'right', 'bottom',
			'width', 'height', 'margin', 'padding', 'border',
			'background', 'color', 'font-family', 'font-size', 'font-weight',
			'line-height', 'text-align', 'z-index', 'opacity', 'visibility'
		];

		const selector = this.generateSelector(element);
		const criticalRules: string[] = [];

		criticalProperties.forEach(property => {
			const value = computedStyles.getPropertyValue(property);
			if (value && value !== 'initial' && value !== 'inherit') {
				criticalRules.push(`${property}: ${value}`);
			}
		});

		if (criticalRules.length > 0) {
			const cssRule = `${selector} { ${criticalRules.join('; ')} }`;
			this.criticalStyles.add(cssRule);
		}
	}

	private generateSelector(element: Element): string {
		// Generate efficient CSS selector
		const tagName = element.tagName.toLowerCase();
		const id = element.id ? `#${element.id}` : '';
		const classes = element.className ? `.${element.className.split(' ').join('.')}` : '';
		
		if (id) return `${tagName}${id}`;
		if (classes) return `${tagName}${classes}`;
		return tagName;
	}

	private deferNonCriticalStyles(): void {
		const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
		
		styleSheets.forEach((link: Element) => {
			const linkElement = link as HTMLLinkElement;
			if (!this.isCriticalStylesheet(linkElement)) {
				this.deferStylesheet(linkElement);
			}
		});
	}

	private isCriticalStylesheet(link: HTMLLinkElement): boolean {
		const href = link.href;
		// Define critical stylesheets that should load immediately
		const criticalPatterns = [
			/app\.css/,
			/critical\.css/,
			/above-fold\.css/
		];

		return criticalPatterns.some(pattern => pattern.test(href));
	}

	private deferStylesheet(link: HTMLLinkElement): void {
		// Convert stylesheet to preload and load it after page load
		link.rel = 'preload';
		link.as = 'stylesheet';
		
		// Add onload handler to apply stylesheet
		link.onload = () => {
			link.rel = 'stylesheet';
			link.onload = null;
		};

		// Fallback for browsers that don't support preload
		setTimeout(() => {
			if (link.rel === 'preload') {
				link.rel = 'stylesheet';
			}
		}, 3000);
	}

	private preloadCriticalFonts(): void {
		// Only preload fonts that actually exist
		// Google Fonts are already optimized and don't need manual preloading
		// since they're loaded via CSS @import which handles caching automatically
		
		// If you have local fonts, add them to the static/fonts/ directory
		// and uncomment the lines below with the correct paths:
		
		// const criticalFonts = [
		//   '/fonts/your-font.woff2'
		// ];
		
		// criticalFonts.forEach(fontUrl => {
		//   const link = document.createElement('link');
		//   link.rel = 'preload';
		//   link.as = 'font';
		//   link.type = 'font/woff2';
		//   link.crossOrigin = 'anonymous';
		//   link.href = fontUrl;
		//   document.head.appendChild(link);
		// });
	}

	// Generate critical CSS string
	generateCriticalCSS(): string {
		return Array.from(this.criticalStyles).join('\n');
	}

	// Inject critical CSS inline
	injectCriticalCSS(): void {
		if (!browser) return;

		const criticalCSS = this.generateCriticalCSS();
		if (criticalCSS.length > 0 && criticalCSS.length < this.config.inlineThreshold!) {
			const style = document.createElement('style');
			style.textContent = criticalCSS;
			style.setAttribute('data-critical', 'true');
			document.head.insertBefore(style, document.head.firstChild);
		}
	}

	// Performance metrics
	getMetrics() {
		return {
			criticalStylesCount: this.criticalStyles.size,
			deferredStylesCount: this.deferredStyles.size,
			criticalCSSSize: this.generateCriticalCSS().length,
			config: this.config
		};
	}
}

// Resource hints utility
export class ResourceHintsManager {
	private static instance: ResourceHintsManager;
	private preloadedResources = new Set<string>();

	static getInstance(): ResourceHintsManager {
		if (!ResourceHintsManager.instance) {
			ResourceHintsManager.instance = new ResourceHintsManager();
		}
		return ResourceHintsManager.instance;
	}

	// DNS prefetch for external domains
	dnsPrefetch(domains: string[]): void {
		if (!browser) return;

		domains.forEach(domain => {
			const link = document.createElement('link');
			link.rel = 'dns-prefetch';
			link.href = `//${domain}`;
			document.head.appendChild(link);
		});
	}

	// Preconnect to critical origins
	preconnect(origins: string[]): void {
		if (!browser) return;

		origins.forEach(origin => {
			const link = document.createElement('link');
			link.rel = 'preconnect';
			link.href = origin;
			document.head.appendChild(link);
		});
	}

	// Preload critical resources
	preloadResource(url: string, as: string, type?: string, crossorigin?: string): void {
		if (!browser || this.preloadedResources.has(url)) return;

		const link = document.createElement('link');
		link.rel = 'preload';
		link.href = url;
		link.as = as;
		
		if (type) link.type = type;
		if (crossorigin) link.crossOrigin = crossorigin;
		
		document.head.appendChild(link);
		this.preloadedResources.add(url);
	}

	// Prefetch likely next resources
	prefetchResource(url: string): void {
		if (!browser || this.preloadedResources.has(url)) return;

		const link = document.createElement('link');
		link.rel = 'prefetch';
		link.href = url;
		document.head.appendChild(link);
		this.preloadedResources.add(url);
	}

	// Module preload for likely routes
	modulePreload(moduleUrl: string): void {
		if (!browser || this.preloadedResources.has(moduleUrl)) return;

		const link = document.createElement('link');
		link.rel = 'modulepreload';
		link.href = moduleUrl;
		document.head.appendChild(link);
		this.preloadedResources.add(moduleUrl);
	}

	// Initialize critical resource hints
	initializeCriticalHints(): void {
		if (!browser) return;

		// DNS prefetch for external services
		this.dnsPrefetch([
			'fonts.googleapis.com',
			'fonts.gstatic.com',
			'api.iconify.design'
		]);

		// Preconnect to critical origins
		this.preconnect([
			'https://fonts.googleapis.com',
			'https://fonts.gstatic.com'
		]);

		// Note: Local fonts should be placed in static/fonts/ directory
		// Google Fonts are automatically optimized via CSS imports
	}
}