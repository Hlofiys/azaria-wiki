// Image optimization utilities
export interface ImageConfig {
	src: string;
	alt: string;
	width?: number;
	height?: number;
	loading?: 'lazy' | 'eager';
	priority?: boolean;
	sizes?: string;
}

// Generate optimized image attributes
export function getOptimizedImageProps(config: ImageConfig) {
	const { src, alt, width, height, loading = 'lazy', priority = false, sizes } = config;

	// Generate srcset for responsive images
	const srcset = generateSrcSet(src, width);

	return {
		src,
		alt,
		width,
		height,
		loading: priority ? 'eager' : loading,
		decoding: 'async' as const,
		srcset: srcset || undefined,
		sizes: sizes || generateSizes(),
		style: {
			// Prevent layout shift
			aspectRatio: width && height ? `${width} / ${height}` : undefined,
			objectFit: 'cover' as const,
			// Optimize rendering
			imageRendering: 'auto' as const,
			// Enable GPU acceleration
			willChange: 'transform',
			// Smooth loading transition
			transition: 'opacity 0.3s ease'
		}
	};
}

// Generate responsive srcset
function generateSrcSet(src: string, width?: number): string | null {
	if (!width || !src.includes('/images/')) {
		return null;
	}

	// Generate different sizes (assuming image processing service)
	const sizes = [0.5, 0.75, 1, 1.5, 2].map((multiplier) => {
		const scaledWidth = Math.round(width * multiplier);
		return `${getResizedImageUrl(src, scaledWidth)} ${scaledWidth}w`;
	});

	return sizes.join(', ');
}

// Generate sizes attribute
function generateSizes(): string {
	// Responsive breakpoints
	return [
		'(max-width: 640px) 100vw',
		'(max-width: 768px) 50vw',
		'(max-width: 1024px) 33vw',
		'25vw'
	].join(', ');
}

// Get resized image URL (placeholder for image service)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getResizedImageUrl(src: string, _width: number): string {
	// In production, this would integrate with an image service like Cloudinary
	// For now, return original URL
	return src;
}

// Lazy loading observer for manual image loading
export class LazyImageLoader {
	private observer: IntersectionObserver | null = null;
	private loadedImages = new Set<string>();

	constructor() {
		if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
			this.observer = new IntersectionObserver(
				(entries) => {
					entries.forEach((entry) => {
						if (entry.isIntersecting) {
							this.loadImage(entry.target as HTMLImageElement);
						}
					});
				},
				{
					// Load images when they're 100px away from viewport
					rootMargin: '100px',
					threshold: 0.01
				}
			);
		}
	}

	observe(img: HTMLImageElement): void {
		if (this.observer && !this.loadedImages.has(img.src)) {
			this.observer.observe(img);
		}
	}

	private loadImage(img: HTMLImageElement): void {
		if (this.loadedImages.has(img.src)) return;

		const dataSrc = img.dataset.src;
		if (dataSrc) {
			img.src = dataSrc;
			img.removeAttribute('data-src');
			this.loadedImages.add(img.src);

			if (this.observer) {
				this.observer.unobserve(img);
			}
		}
	}

	disconnect(): void {
		if (this.observer) {
			this.observer.disconnect();
		}
	}
}

// Preload critical images
export function preloadImage(src: string, priority = false): void {
	if (typeof window === 'undefined') return;

	const link = document.createElement('link');
	link.rel = 'preload';
	link.as = 'image';
	link.href = src;

	if (priority) {
		link.setAttribute('fetchpriority', 'high');
	}

	document.head.appendChild(link);
}

// Image format detection and optimization
export function getOptimalImageFormat(): 'webp' | 'avif' | 'jpeg' {
	if (typeof window === 'undefined') return 'jpeg';

	// Check for AVIF support
	const canvas = document.createElement('canvas');
	canvas.width = 1;
	canvas.height = 1;

	if (canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0) {
		return 'avif';
	}

	// Check for WebP support
	if (canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0) {
		return 'webp';
	}

	return 'jpeg';
}
