<!-- Lazy route component loader -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { createLazyComponent, AdvancedLazyLoader } from '$lib/utils/lazy-loader';
	import LoadingAnimations from './LoadingAnimations.svelte';

	interface LazyRouteProps {
		loader: () => Promise<{ default: any }>;
		fallback?: any;
		errorComponent?: any;
		preload?: boolean;
		delay?: number;
		timeout?: number;
	}

	let {
		loader,
		fallback = LoadingAnimations,
		errorComponent,
		preload = false,
		delay = 0,
		timeout = 10000,
		...props
	}: LazyRouteProps = $props();

	let containerElement: HTMLElement;
	let showComponent = $state(!delay || preload);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;

	// Create lazy component
	const lazyComponent = createLazyComponent(loader, { preload });

	// State derived from lazy component
	let isLoading = $derived(lazyComponent.isLoading);
	let isLoaded = $derived(lazyComponent.isLoaded);
	let component = $derived(lazyComponent.component);
	let error = $derived(lazyComponent.error);

	onMount(() => {
		const lazyLoader = AdvancedLazyLoader.getInstance();

		// Set up timeout for loading
		if (timeout > 0) {
			timeoutId = setTimeout(() => {
				if (!isLoaded && !error) {
					console.warn(`Lazy route loading timed out after ${timeout}ms`);
				}
			}, timeout);
		}

		let cleanup: (() => void) | null = null;

		if (!preload && delay === 0) {
			// Load when element becomes visible
			cleanup = lazyLoader.observe(
				containerElement,
				() => {
					showComponent = true;
					lazyComponent.load().catch((err) => {
						console.error('Failed to load lazy route:', err);
					});
				},
				{ threshold: 0.1, rootMargin: '100px' }
			);
		} else if (delay > 0) {
			// Load after delay
			const delayTimeout = setTimeout(() => {
				showComponent = true;
				lazyComponent.load().catch((err) => {
					console.error('Failed to load lazy route:', err);
				});
			}, delay);

			cleanup = () => clearTimeout(delayTimeout);
		}

		return () => {
			if (cleanup) cleanup();
			if (timeoutId) clearTimeout(timeoutId);
		};
	});

	// Auto-load if preload is enabled
	$effect(() => {
		if (preload && !isLoaded && !isLoading && !error) {
			lazyComponent.load().catch((err) => {
				console.error('Failed to preload lazy route:', err);
			});
		}
	});
</script>

<div bind:this={containerElement} class="lazy-route-container">
	{#if !showComponent}
		<!-- Pre-loading state -->
		<div class="lazy-route-placeholder">
			{#if fallback}
				<svelte:component this={fallback} />
			{:else}
				<div class="flex items-center justify-center p-8">
					<div class="animate-pulse text-gray-500">Загрузка...</div>
				</div>
			{/if}
		</div>
	{:else if error}
		<!-- Error state -->
		<div class="lazy-route-error">
			{#if errorComponent}
				<svelte:component this={errorComponent} {error} />
			{:else}
				<div class="flex flex-col items-center justify-center p-8 text-red-500">
					<div class="mb-2">⚠️ Ошибка загрузки</div>
					<button 
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
						onclick={() => {
							lazyComponent.load().catch(() => {});
						}}
					>
						Попробовать снова
					</button>
				</div>
			{/if}
		</div>
	{:else if isLoading}
		<!-- Loading state -->
		<div class="lazy-route-loading">
			{#if fallback}
				<svelte:component this={fallback} />
			{:else}
				<div class="flex items-center justify-center p-8">
					<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a876]"></div>
					<span class="ml-3 text-gray-400">Загрузка компонента...</span>
				</div>
			{/if}
		</div>
	{:else if component}
		<!-- Loaded component -->
		<div class="lazy-route-content opacity-0 animate-fade-in">
			<svelte:component this={component} {...props} />
		</div>
	{/if}
</div>

<style>
	.lazy-route-container {
		min-height: 200px;
		position: relative;
	}

	:global(.lazy-route-content) {
		animation: fadeIn 0.3s ease-in-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.lazy-route-placeholder,
	.lazy-route-loading,
	.lazy-route-error {
		min-height: inherit;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>