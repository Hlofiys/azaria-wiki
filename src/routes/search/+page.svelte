<script lang="ts">
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { Icon, getUIIcon } from '$lib/icons';
	import { resolve } from '$app/paths';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Поиск: {data.query} — Азария Вики</title>
	<meta name="description" content="Результаты поиска по запросу '{data.query}' в мире Азарии." />
</svelte:head>

<div class="mx-auto max-w-7xl">
	<div class="mb-8">
		<h1 class="font-heading text-azaria-gold mb-4 text-center text-2xl md:text-3xl">
			<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
				<Icon icon={getUIIcon('search')} />
				<span>Результаты поиска</span>
			</div>
		</h1>

		{#if data.query}
			<p class="text-azaria-text/80 mb-6 text-center">
				Поиск по запросу: <span class="text-azaria-gold font-semibold">"{data.query}"</span>
			</p>

			{#if data.results.length > 0}
				<p class="text-azaria-text/60 mb-8 text-center text-sm">
					Найдено {data.results.length} результат{data.results.length === 1
						? ''
						: data.results.length < 5
							? 'а'
							: 'ов'}
				</p>

				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
					{#each data.results as entry (entry.slug)}
						<LoreCard {entry} showCategory={true} />
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center">
					<Icon icon={getUIIcon('question')} class="text-azaria-text/30 mx-auto mb-4 text-6xl" />
					<h2 class="text-azaria-text/80 mb-2 text-xl">Ничего не найдено</h2>
					<p class="text-azaria-text/60 mb-6">
						По вашему запросу "{data.query}" не найдено ни одной статьи.
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
