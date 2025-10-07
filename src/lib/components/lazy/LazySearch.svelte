<!-- Lazy-loaded Search components -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { AdvancedLazyLoader } from '$lib/utils/lazy-loader';

	let containerElement: HTMLElement;
	let isVisible = $state(false);
	let isLoaded = $state(false);
	let searchComponents: any = {};

	onMount(() => {
		const lazyLoader = AdvancedLazyLoader.getInstance();
		
		const cleanup = lazyLoader.observe(
			containerElement,
			async () => {
				isVisible = true;
				await loadSearchComponents();
			},
			{
				threshold: 0.1,
				rootMargin: '50px'
			}
		);

		return cleanup;
	});

	async function loadSearchComponents() {
		try {
			// Load search-related components in parallel
			const [searchInputModule, searchResultsModule] = await Promise.all([
				import('../ui/SearchInput.svelte'),
				import('../ui/SearchResults.svelte')
			]);

			searchComponents = {
				SearchInput: searchInputModule.default,
				SearchResults: searchResultsModule.default
			};
			
			isLoaded = true;
		} catch (error) {
			console.error('Failed to load search components:', error);
		}
	}
</script>

<div bind:this={containerElement} class="lazy-search-container">
	{#if !isVisible}
		<!-- Search skeleton -->
		<div class="search-skeleton">
			<div class="animate-pulse space-y-4">
				<div class="bg-gray-700 h-12 rounded-lg"></div>
				<div class="space-y-3">
					{#each Array(3) as _}
						<div class="bg-gray-700 h-20 rounded-lg"></div>
					{/each}
				</div>
			</div>
		</div>
	{:else if !isLoaded}
		<!-- Loading state -->
		<div class="search-loading">
			<div class="flex items-center justify-center py-8">
				<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#c9a876]"></div>
				<span class="ml-2 text-gray-400">Загрузка поиска...</span>
			</div>
		</div>
	{:else}
		<!-- Loaded search components -->
		<div class="search-content animate-fade-in">
			<slot {searchComponents} />
		</div>
	{/if}
</div>

<style>
	.search-content {
		opacity: 0;
		animation: fadeIn 0.3s ease-out forwards;
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
</style>