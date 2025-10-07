<!-- Lazy-loaded Infobox component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { AdvancedLazyLoader } from '$lib/utils/lazy-loader';
	import type { EntryMetadata, EntryListItem } from '$lib/server/lore-parser';

	let { 
		entry, 
		backlinks = [] 
	}: { 
		entry: EntryMetadata; 
		backlinks?: EntryListItem[] 
	} = $props();

	let containerElement: HTMLElement;
	let isVisible = $state(false);
	let isLoaded = $state(false);
	let InfoboxComponent = $state<any>(null);

	onMount(() => {
		const lazyLoader = AdvancedLazyLoader.getInstance();
		
		const cleanup = lazyLoader.observe(
			containerElement,
			async () => {
				isVisible = true;
				try {
					const module = await import('../ui/Infobox.svelte');
					InfoboxComponent = module.default;
					isLoaded = true;
				} catch (error) {
					console.error('Failed to load Infobox component:', error);
				}
			},
			{
				threshold: 0.1,
				rootMargin: '50px'
			}
		);

		return cleanup;
	});
</script>

<div bind:this={containerElement} class="lazy-infobox-container">
	{#if !isVisible}
		<!-- Infobox skeleton -->
		<div class="infobox-skeleton sticky top-4 lg:top-6">
			<div class="animate-pulse">
				<div class="bg-gray-700 rounded-lg p-6">
					<div class="flex items-center gap-2 mb-4">
						<div class="bg-gray-600 h-6 w-6 rounded"></div>
						<div class="bg-gray-600 h-6 w-32 rounded"></div>
					</div>
					<div class="bg-gray-600 h-32 w-full rounded mb-4"></div>
					<div class="space-y-3">
						<div class="bg-gray-600 h-4 w-full rounded"></div>
						<div class="bg-gray-600 h-4 w-3/4 rounded"></div>
						<div class="bg-gray-600 h-4 w-1/2 rounded"></div>
					</div>
				</div>
			</div>
		</div>
	{:else if !isLoaded}
		<!-- Loading state -->
		<div class="infobox-loading sticky top-4 lg:top-6">
			<div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
				<div class="flex items-center justify-center h-40">
					<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c9a876]"></div>
					<span class="ml-2 text-gray-400 text-sm">Загрузка информации...</span>
				</div>
			</div>
		</div>
	{:else if InfoboxComponent}
		<!-- Loaded component -->
		<div class="infobox-content animate-fade-in">
			{@render InfoboxComponent?.({ entry, backlinks })}
		</div>
	{/if}
</div>

<style>
	.infobox-content {
		opacity: 0;
		animation: fadeIn 0.4s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}
</style>