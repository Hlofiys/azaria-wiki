<!-- Lazy-loaded LoreCard component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { AdvancedLazyLoader } from '$lib/utils/lazy-loader';
	import type { EntryListItem } from '$lib/server/lore-parser';

	let { entry, showCategory = true }: { entry: EntryListItem; showCategory?: boolean } = $props();

	let containerElement: HTMLElement;
	let isVisible = $state(false);
	let isLoaded = $state(false);
	let LoreCardComponent = $state<any>(null);

	onMount(() => {
		const lazyLoader = AdvancedLazyLoader.getInstance();
		
		const cleanup = lazyLoader.observe(
			containerElement,
			async () => {
				isVisible = true;
				try {
					// Dynamic import of the actual LoreCard component
					const module = await import('../ui/MemoizedLoreCard.svelte');
					LoreCardComponent = module.default;
					isLoaded = true;
				} catch (error) {
					console.error('Failed to load LoreCard component:', error);
				}
			},
			{
				threshold: 0.1,
				rootMargin: '100px' // Load when 100px away from viewport
			}
		);

		return cleanup;
	});
</script>

<div bind:this={containerElement} class="lazy-lore-card-container">
	{#if !isVisible}
		<!-- Placeholder skeleton -->
		<div class="lore-card-skeleton">
			<div class="animate-pulse">
				<div class="bg-gray-700 rounded-lg p-4">
					<div class="bg-gray-600 h-4 w-20 rounded mb-2"></div>
					<div class="bg-gray-600 h-6 w-3/4 rounded mb-3"></div>
					<div class="space-y-2">
						<div class="bg-gray-600 h-3 w-full rounded"></div>
						<div class="bg-gray-600 h-3 w-2/3 rounded"></div>
					</div>
					<div class="flex gap-2 mt-3">
						<div class="bg-gray-600 h-6 w-16 rounded"></div>
						<div class="bg-gray-600 h-6 w-20 rounded"></div>
					</div>
				</div>
			</div>
		</div>
	{:else if !isLoaded}
		<!-- Loading state -->
		<div class="lore-card-loading">
			<div class="bg-gray-800 rounded-lg p-4 border border-gray-700">
				<div class="flex items-center justify-center h-32">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c9a876]"></div>
					<span class="ml-2 text-gray-400 text-sm">Загрузка...</span>
				</div>
			</div>
		</div>
	{:else if LoreCardComponent}
		<!-- Loaded component with fade-in animation -->
		<div class="lore-card-content animate-fade-in">
			{@render LoreCardComponent?.({ entry, showCategory })}
		</div>
	{/if}
</div>

<style>
	.lazy-lore-card-container {
		min-height: 200px;
	}

	.lore-card-skeleton {
		height: 200px;
	}

	.lore-card-loading {
		height: 200px;
	}

	.lore-card-content {
		opacity: 0;
		animation: fadeIn 0.3s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>