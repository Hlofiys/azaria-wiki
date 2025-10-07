<!-- Enhanced lazy loading image component with optimization -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { LazyImageLoader } from '$lib/utils/lazy-loader';

	let {
		src,
		alt,
		class: className = '',
		style = '',
		width,
		height,
		loading = 'lazy',
		...rest
	}: {
		src: string;
		alt: string;
		class?: string;
		style?: string;
		width?: number;
		height?: number;
		loading?: 'lazy' | 'eager';
		[key: string]: any;
	} = $props();

	let imgElement: HTMLImageElement;
	let isLoaded = $state(false);
	let hasError = $state(false);
	let isVisible = $state(loading === 'eager');

	onMount(() => {
		if (loading === 'lazy' && imgElement) {
			const lazyImageLoader = LazyImageLoader.getInstance();
			
			const cleanup = lazyImageLoader.loadImage(imgElement, src, {
				threshold: 0.1,
				rootMargin: '50px'
			});

			imgElement.addEventListener('load', handleLoad);
			imgElement.addEventListener('error', handleError);

			return () => {
				cleanup();
				imgElement?.removeEventListener('load', handleLoad);
				imgElement?.removeEventListener('error', handleError);
			};
		} else {
			isVisible = true;
		}
	});

	function handleLoad() {
		isLoaded = true;
	}

	function handleError() {
		hasError = true;
	}

	// Generate optimized style with aspect ratio preservation
	let optimizedStyle = $derived.by(() => {
		let baseStyle = style;
		
		if (width && height) {
			baseStyle += `; aspect-ratio: ${width} / ${height}`;
		}
		
		if (!isLoaded && !hasError) {
			baseStyle += '; background: linear-gradient(90deg, #2a2a2a 25%, #333 50%, #2a2a2a 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite;';
		}
		
		return baseStyle;
	});
</script>

{#if isVisible}
	<img
		bind:this={imgElement}
		{src}
		{alt}
		{width}
		{height}
		class={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
		style={optimizedStyle}
		onload={handleLoad}
		onerror={handleError}
		{...rest}
	/>
{:else}
	<!-- Placeholder while not visible -->
	<div
		class={`bg-gray-800 ${className}`}
		style={`${style}; ${width && height ? `aspect-ratio: ${width} / ${height};` : ''}`}
		role="img"
		aria-label={`Loading ${alt}`}
	></div>
{/if}

{#if hasError}
	<div
		class={`bg-gray-800 flex items-center justify-center text-gray-500 ${className}`}
		style={optimizedStyle}
		role="img"
		aria-label={`Failed to load ${alt}`}
	>
		<span class="text-sm">Изображение недоступно</span>
	</div>
{/if}

<style>
	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}
</style>