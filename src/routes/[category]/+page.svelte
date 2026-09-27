<script lang="ts">
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { Icon, getCategoryIcon, getUIIcon } from '$lib/icons';
	import {
		getCategoryDescription,
		getCategoryName,
		type CategoryType
	} from '$lib/utils/categories';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let sortBy = $state<'title' | 'type' | 'faction'>('title');
	let view = $state<'grid' | 'ledger'>('grid');
	let activeTag = $state('');

	const category = $derived($page.params.category as CategoryType);
	let ready = $state(false);

	onMount(() => {
		const params = $page.url.searchParams;
		query = params.get('q') ?? '';
		activeTag = params.get('tag') ?? '';
		view = params.get('view') === 'ledger' ? 'ledger' : 'grid';
		const sort = params.get('sort');
		sortBy = sort === 'type' || sort === 'faction' ? sort : 'title';
		ready = true;
	});

	// Keep filters shareable: mirror them into the query string.
	$effect(() => {
		if (!ready) return;

		const parts: string[] = [];
		if (query.trim()) parts.push(`q=${encodeURIComponent(query.trim())}`);
		if (activeTag) parts.push(`tag=${encodeURIComponent(activeTag)}`);
		if (sortBy !== 'title') parts.push(`sort=${sortBy}`);
		if (view !== 'grid') parts.push(`view=${view}`);

		const search = parts.length > 0 ? `?${parts.join('&')}` : '';
		const next = `${$page.url.pathname}${search}`;
		if (next !== `${$page.url.pathname}${$page.url.search}`) {
			// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() cannot carry query strings
			goto(next, { replaceState: true, noScroll: true, keepFocus: true });
		}
	});

	const tags = $derived.by(() => {
		const counts: Record<string, number> = {};
		for (const entry of data.entries) {
			for (const tag of entry.tags ?? []) {
				counts[tag] = (counts[tag] ?? 0) + 1;
			}
		}
		return Object.entries(counts)
			.filter(([, count]) => count > 1)
			.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ru'))
			.slice(0, 14)
			.map(([tag, count]) => ({ tag, count }));
	});

	const entries = $derived.by(() => {
		const needle = query.trim().toLowerCase();
		let list = [...data.entries];

		if (needle) {
			list = list.filter((entry) =>
				[entry.title, entry.faction, entry.type, entry.status, ...(entry.tags ?? [])]
					.filter(Boolean)
					.some((field) => String(field).toLowerCase().includes(needle))
			);
		}

		if (activeTag) {
			list = list.filter((entry) => (entry.tags ?? []).includes(activeTag));
		}

		return list.sort((a, b) => {
			if (sortBy === 'type') return (a.type ?? '').localeCompare(b.type ?? '', 'ru');
			if (sortBy === 'faction') return (a.faction ?? '').localeCompare(b.faction ?? '', 'ru');
			return (a.title ?? '').localeCompare(b.title ?? '', 'ru');
		});
	});

	const hasFilters = $derived(Boolean(query.trim() || activeTag));

	function resetFilters() {
		query = '';
		activeTag = '';
	}
</script>

<svelte:head>
	<title>{data.categoryInfo.title} — Азария Вики</title>
	<meta name="description" content={data.categoryInfo.description} />
</svelte:head>

<div class="seal" data-seal={category}>
	<!-- Section header -->
	<header
		class="flex flex-col gap-6 border-b border-line pb-7 sm:flex-row sm:items-end sm:justify-between"
	>
		<div>
			<p class="eyebrow">Раздел гроссбуха</p>
			<h1 class="mt-3 flex items-center gap-3 font-display text-3xl sm:text-4xl">
				<Icon icon={getCategoryIcon(category)} width="30" class="seal-text" />
				{getCategoryName(category)}
			</h1>
			<p class="mt-3 max-w-2xl text-parchment-dim">{getCategoryDescription(category)}</p>
		</div>
		<p class="chip chip--brass self-start sm:self-auto">Записей: {data.entries.length}</p>
	</header>

	<!-- Controls -->
	<div class="mt-6 flex flex-col gap-4">
		<div class="flex flex-col gap-3 sm:flex-row sm:items-center">
			<div class="relative flex-1">
				<Icon
					icon={getUIIcon('search')}
					width="15"
					class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-parchment-mute"
				/>
				<input
					class="input pl-9"
					type="search"
					placeholder="Поиск по названию, типу, метке…"
					aria-label="Поиск по разделу"
					bind:value={query}
				/>
			</div>

			<div class="flex items-center gap-2">
				<label class="eyebrow shrink-0" for="sort">Сортировка</label>
				<select id="sort" class="select w-auto" bind:value={sortBy}>
					<option value="title">По названию</option>
					<option value="type">По типу</option>
					<option value="faction">По фракции</option>
				</select>
			</div>

			<div class="flex shrink-0 items-center gap-1" role="group" aria-label="Вид списка">
				<button
					type="button"
					class="icon-btn"
					class:bg-ink-700={view === 'grid'}
					aria-pressed={view === 'grid'}
					title="Сетка"
					onclick={() => (view = 'grid')}
				>
					<Icon icon="mdi:view-grid-outline" width="16" />
				</button>
				<button
					type="button"
					class="icon-btn"
					class:bg-ink-700={view === 'ledger'}
					aria-pressed={view === 'ledger'}
					title="Гроссбух"
					onclick={() => (view = 'ledger')}
				>
					<Icon icon="mdi:format-list-bulleted" width="16" />
				</button>
			</div>
		</div>

		{#if tags.length > 0}
			<div class="flex flex-wrap items-center gap-2">
				<span class="eyebrow mr-1">Метки</span>
				{#each tags as { tag, count } (tag)}
					<button
						type="button"
						class="chip transition-colors"
						class:chip--brass={activeTag === tag}
						class:text-brass-bright={activeTag === tag}
						aria-pressed={activeTag === tag}
						onclick={() => (activeTag = activeTag === tag ? '' : tag)}
					>
						{tag}
						<span class="folio">{count}</span>
					</button>
				{/each}
				{#if hasFilters}
					<button type="button" class="btn btn--quiet btn--sm" onclick={resetFilters}>
						<Icon icon={getUIIcon('close')} width="12" />
						Сбросить
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Results -->
	<div class="mt-7">
		{#if entries.length > 0}
			<p class="folio mb-4">Показано {entries.length} из {data.entries.length}</p>

			{#if view === 'grid'}
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each entries as entry (entry.slug)}
						<LoreCard {entry} showCategory={false} />
					{/each}
				</div>
			{:else}
				<div class="frame frame--quiet @container">
					<div
						class="relative z-10 hidden grid-cols-[5.5rem_minmax(0,1fr)_13rem_13rem_1.25rem] gap-x-4 border-b border-line px-3 py-2 @4xl:grid"
					>
						<span class="eyebrow">Лист</span>
						<span class="eyebrow">Название</span>
						<span class="eyebrow">Тип</span>
						<span class="eyebrow">Метки</span>
						<span></span>
					</div>
					<div class="relative z-10">
						{#each entries as entry (entry.slug)}
							<LoreCard {entry} variant="ledger" showCategory={false} />
						{/each}
					</div>
				</div>
			{/if}
		{:else}
			<div class="frame frame--quiet py-16 text-center">
				<div class="relative z-10 flex flex-col items-center gap-4">
					<Icon icon={getUIIcon('question')} width="34" class="text-parchment-mute" />
					<p class="font-display text-xl">Ничего не найдено</p>
					<p class="max-w-sm text-sm text-parchment-mute">
						Попробуйте изменить запрос или снять метку — в гроссбухе есть и другие записи.
					</p>
					{#if hasFilters}
						<button type="button" class="btn btn--sm" onclick={resetFilters}
							>Сбросить фильтры</button
						>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Related sections -->
	<div class="mt-14">
		<SectionHeading eyebrow="Смежные разделы" title="Смотреть дальше" />
		<div class="mt-5 flex flex-wrap gap-2">
			{#each data.allCategories as other (other)}
				<a
					href={resolve(`/${other}` as `/${string}`)}
					data-seal={other}
					class="chip chip--brass seal gap-2"
				>
					<Icon icon={getCategoryIcon(other)} width="12" class="seal-text" />
					{getCategoryName(other)}
					<span class="folio">{data.categoryCounts[other] ?? 0}</span>
				</a>
			{/each}
		</div>
	</div>
</div>
