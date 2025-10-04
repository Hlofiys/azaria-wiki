<script lang="ts">
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { Icon, getUIIcon } from '$lib/icons';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';
	import { initializeClientData, searchEntries } from '$lib/client-data.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { EntryListItem } from '$lib/server/lore-parser';

	export let data: PageData;
	
	let searchResults: EntryListItem[] = [];
	let query = '';
	
	onMount(() => {
		// Initialize client data with all entries
		initializeClientData(data.allEntries);
		
		// Get query from URL - only in browser
		if (typeof window !== 'undefined') {
			query = $page.url.searchParams.get('q') || '';
			
			// Perform search if query exists
			if (query.trim()) {
				searchResults = searchEntries(query);
			}
		}
	});
	
	// Reactive statement to update results when URL changes - only in browser
	$: if (typeof window !== 'undefined' && $page.url.searchParams.get('q') !== query) {
		query = $page.url.searchParams.get('q') || '';
		if (query.trim() && data.allEntries.length > 0) {
			searchResults = searchEntries(query);
		} else {
			searchResults = [];
		}
	}
</script>

<svelte:head>
	<title>Поиск — Азария Вики</title>
	<meta name="description" content="Поиск по статьям в мире Азарии." />
</svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="mb-8">
		<h1 class="font-heading text-azaria-gold mb-4 text-center text-2xl md:text-3xl">
			<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
				<Icon icon={getUIIcon('search')} />
				<span>Результаты поиска</span>
			</div>
		</h1>

		{#if query}
			<p class="text-azaria-text/80 mb-6 text-center">
				Поиск по запросу: <span class="text-azaria-gold font-semibold">"{query}"</span>
			</p>

			{#if searchResults.length > 0}
				<p class="text-azaria-text/60 mb-8 text-center text-sm">
					Найдено {searchResults.length} результат{searchResults.length === 1
						? ''
						: searchResults.length < 5
							? 'а'
							: 'ов'}
				</p>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
					{#each searchResults as entry (entry.slug)}
						<LoreCard {entry} showCategory={true} />
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<Icon icon={getUIIcon('question')} class="text-azaria-text/30 mx-auto mb-4 text-6xl" />
					<h2 class="text-azaria-text/80 mb-2 text-xl">Ничего не найдено</h2>
					<p class="text-azaria-text/60 mb-6">
						По вашему запросу "{query}" не найдено ни одной статьи.
					</p>
					<a href={resolve('/')} class="azaria-btn inline-block">
						<Icon icon={getUIIcon('home')} class="mr-2 inline" />
						Вернуться на главную
					</a>
				</div>
			{/if}
		{:else}
			<div class="py-12 text-center">
				<Icon icon={getUIIcon('search')} class="text-azaria-text/30 mx-auto mb-4 text-6xl" />
				<h2 class="text-azaria-text/80 mb-2 text-xl">Введите поисковый запрос</h2>
				<p class="text-azaria-text/60">
					Используйте поиск в верхней части страницы, чтобы найти статьи в мире Азарии.
				</p>
			</div>
		{/if}
	</div>
</div>
