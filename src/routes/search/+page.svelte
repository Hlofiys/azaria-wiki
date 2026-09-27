<script lang="ts">
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { Icon, getCategoryIcon, getUIIcon } from '$lib/icons';
	import { CATEGORY_ORDER, categoryNames } from '$lib/utils/categories';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { searchEntries } from '$lib/client-data.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// The URL is the source of truth; the input is just a draft.
	const urlQuery = $derived($page.url.searchParams.get('q') ?? '');
	let query = $state('');
	let syncedFrom = $state('');

	$effect(() => {
		if (urlQuery !== syncedFrom) {
			syncedFrom = urlQuery;
			query = urlQuery;
		}
	});

	const results = $derived.by(() => {
		const needle = urlQuery.trim();
		if (!needle) return [];

		// Server-rendered results for the initial load; client index afterwards.
		if (needle === data.initialQuery.trim() && data.initialResults.length > 0) {
			return data.initialResults;
		}

		return searchEntries(needle);
	});

	const searched = $derived(Boolean(urlQuery.trim()));

	function submit() {
		goto(resolve(`/search?q=${encodeURIComponent(query.trim())}`));
	}

	const grouped = $derived(
		CATEGORY_ORDER.map((category) => ({
			category,
			entries: results.filter((entry) => entry.category === category)
		})).filter((group) => group.entries.length > 0)
	);
</script>

<svelte:head>
	<title>Поиск — Азария Вики</title>
	<meta name="description" content="Поиск по гроссбуху мира Азарии." />
</svelte:head>

<div class="mx-auto max-w-4xl">
	<header class="border-b border-line pb-6">
		<p class="eyebrow">Указатель гроссбуха</p>
		<h1 class="mt-3 font-display text-3xl sm:text-4xl">Поиск по записям</h1>
		<form
			onsubmit={(event) => {
				event.preventDefault();
				submit();
			}}
			class="relative mt-5"
		>
			<Icon
				icon={getUIIcon('search')}
				width="16"
				class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-parchment-mute"
			/>
			<input
				class="input py-3 pl-10 text-base"
				type="search"
				placeholder="Название, тип, метка…"
				aria-label="Поисковый запрос"
				bind:value={query}
			/>
		</form>
	</header>

	{#if searched}
		<p class="folio mt-5">
			По запросу «{urlQuery}» найдено {results.length}
			{results.length === 1
				? 'запись'
				: results.length < 5 && results.length > 0
					? 'записи'
					: 'записей'}
		</p>

		{#if results.length > 0}
			<div class="mt-8 flex flex-col gap-10">
				{#each grouped as group (group.category)}
					<section class="seal" data-seal={group.category}>
						<div class="mb-4 flex items-center gap-3 border-b border-line pb-2">
							<Icon icon={getCategoryIcon(group.category)} width="16" class="seal-text" />
							<h2 class="font-display text-xl">{categoryNames[group.category].plural}</h2>
							<span class="folio ml-auto">{group.entries.length}</span>
						</div>
						<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							{#each group.entries as entry (entry.slug)}
								<LoreCard {entry} showCategory={false} />
							{/each}
						</div>
					</section>
				{/each}
			</div>
		{:else}
			<div class="frame frame--quiet mt-8 py-16 text-center">
				<div class="relative z-10 flex flex-col items-center gap-4">
					<Icon icon={getUIIcon('question')} width="34" class="text-parchment-mute" />
					<p class="font-display text-xl">Ничего не найдено</p>
					<p class="max-w-sm text-sm text-parchment-mute">
						Такой записи в гроссбухе нет. Возможно, её ещё не вписали — или уже вычеркнули.
					</p>
					<a href={resolve('/')} class="btn btn--sm">
						<Icon icon={getUIIcon('home')} width="13" />
						На главную
					</a>
				</div>
			</div>
		{/if}
	{:else}
		<div class="mt-10 flex flex-col items-start gap-4">
			<p class="max-w-lg text-parchment-dim">
				Введите запрос — начните с раздела или метки. Поиск идёт по названиям, типам, фракциям и
				меткам.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each CATEGORY_ORDER as category (category)}
					<a
						href={resolve(`/${category}` as `/${string}`)}
						data-seal={category}
						class="chip chip--brass seal gap-2"
					>
						<Icon icon={getCategoryIcon(category)} width="12" class="seal-text" />
						{categoryNames[category].plural}
					</a>
				{/each}
			</div>
		</div>
	{/if}
</div>
