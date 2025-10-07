<script lang="ts">
	import LazyLoreCard from '$lib/components/lazy/LazyLoreCard.svelte';
	import { page } from '$app/stores';
	import { Icon, getCategoryIcon, getUIIcon, getCategoryColors } from '$lib/icons';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import type { CategoryType } from '$lib/icons';

	export let data: PageData;

	let mounted = false;

	onMount(() => {
		mounted = true;
	});

	$: categoryColors = getCategoryColors($page.params.category as CategoryType);

	let searchQuery = '';
	let sortBy = 'title';

	function sortAndFilter(entries: typeof data.entries, query: string, sort: string) {
		let filtered = [...entries];

		// Filter by search query
		if (query.trim()) {
			const q = query.toLowerCase();
			filtered = filtered.filter(
				(entry) =>
					(entry.title || '').toLowerCase().includes(q) ||
					(entry.faction && entry.faction.toLowerCase().includes(q)) ||
					(entry.type && entry.type.toLowerCase().includes(q)) ||
					(entry.tags && entry.tags.some((tag) => tag.toLowerCase().includes(q)))
			);
		}

		// Sort entries
		filtered = filtered.sort((a, b) => {
			switch (sort) {
				case 'title':
					return (a.title || '').localeCompare(b.title || '', 'ru');
				case 'faction':
					return (a.faction || '').localeCompare(b.faction || '', 'ru');
				case 'type':
					return (a.type || '').localeCompare(b.type || '', 'ru');
				default:
					return 0;
			}
		});

		return filtered;
	}

	// Reactive filtering and sorting
	$: filteredEntries = sortAndFilter(data.entries, searchQuery, sortBy);
</script>

<svelte:head>
	<title>{data.categoryInfo.title} — Азария Вики</title>
	<meta name="description" content={data.categoryInfo.description} />
</svelte:head>

<div class="mx-auto max-w-7xl px-2 sm:px-4">
	<!-- Category Header -->
	<div class="mb-6 text-center md:mb-8">
		<div
			class="inline-block transition-all duration-1000 ease-out"
			style="transform: {mounted ? 'translateY(0)' : 'translateY(-20px)'}; opacity: {mounted
				? '1'
				: '0'};"
		>
			<h1
				class="font-heading mb-3 text-2xl sm:text-3xl md:mb-4 md:text-4xl lg:text-5xl"
				style="color: #c9a876; text-shadow: 0 0 8px rgba(201, 168, 118, 0.4);"
			>
				<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
					<Icon
						icon={getCategoryIcon($page.params.category as CategoryType)}
						class="transition-all duration-500"
						style="color: {categoryColors.primary}; filter: drop-shadow(0 0 8px {categoryColors.glow});"
					/>
					<span>{data.categoryInfo.title}</span>
				</div>
			</h1>
		</div>
		<p
			class="text-azaria-text/80 font-body mx-auto max-w-2xl px-4 text-base transition-all delay-200 duration-1000 ease-out sm:text-lg md:text-xl"
			style="transform: {mounted ? 'translateY(0)' : 'translateY(20px)'}; opacity: {mounted
				? '1'
				: '0'};"
		>
			{data.categoryInfo.description}
		</p>
		<div
			class="text-azaria-text/60 mt-3 text-xs transition-all delay-400 duration-1000 ease-out sm:text-sm md:mt-4"
			style="opacity: {mounted ? '1' : '0'};"
		>
			<span
				class="inline-block rounded-full px-3 py-1"
				style="background: {categoryColors.bg}; border: 1px solid {categoryColors.border}50; color: {categoryColors.secondary};"
			>
				Всего записей: {data.entries.length}
			</span>
		</div>
	</div>

	<!-- Search and Filter Controls -->
	<div
		class="relative mb-6 overflow-hidden rounded-lg transition-all delay-600 duration-1000 ease-out md:mb-8"
		style="
			background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
			border: 1px solid rgba(201, 168, 118, 0.3);
			transform: {mounted ? 'translateY(0)' : 'translateY(20px)'};
			opacity: {mounted ? '1' : '0'};
		"
	>
		<!-- Subtle category accent -->
		<div
			class="absolute top-0 left-0 h-1 w-full"
			style="background: linear-gradient(90deg, {categoryColors.primary} 0%, transparent 100%);"
		></div>

		<div class="p-4 md:p-6">
			<div class="flex flex-col gap-4">
				<!-- Search -->
				<div class="w-full">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Поиск по названию, фракции, типу..."
						class="w-full rounded-lg border px-3 py-2 text-sm transition-all duration-300 md:px-4 md:py-2 md:text-base"
						style="
							background: #1a1a1a;
							color: #d0d0d0;
							border-color: rgba(201, 168, 118, 0.3);
						"
						on:focus={(e) => {
							const target = e.target as HTMLElement;
							if (target) target.style.borderColor = categoryColors.border;
						}}
						on:blur={(e) => {
							const target = e.target as HTMLElement;
							if (target) target.style.borderColor = 'rgba(201, 168, 118, 0.3)';
						}}
					/>
				</div>

				<!-- Sort and Results -->
				<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<!-- Sort -->
					<div class="flex items-center space-x-2">
						<label for="sort-select" class="text-azaria-text font-body text-sm md:text-base"
							>Сортировка:</label
						>
						<select
							id="sort-select"
							bind:value={sortBy}
							class="rounded-lg border px-3 py-2 text-sm transition-colors duration-300 md:text-base"
							style="
								background: #1a1a1a;
								color: #d0d0d0;
								border-color: rgba(201, 168, 118, 0.3);
							"
						>
							<option value="title">По названию</option>
							<option value="faction">По фракции</option>
							<option value="type">По типу</option>
						</select>
					</div>

					<!-- Results Count -->
					<div
						class="rounded-full px-3 py-1 text-xs sm:text-sm"
						style="background: {categoryColors.bg}; color: {categoryColors.secondary};"
					>
						Показано: {filteredEntries.length} из {data.entries.length}
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Entries Grid -->
	{#if filteredEntries.length > 0}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
			{#each filteredEntries as entry, index (entry.slug)}
				<div
					class="transition-all duration-700 ease-out"
					style="
						transform: {mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)'};
						opacity: {mounted ? '1' : '0'};
						transition-delay: {800 + index * 100}ms;
					"
				>
					<LazyLoreCard {entry} showCategory={false} />
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="py-8 text-center transition-all delay-800 duration-1000 ease-out md:py-12"
			style="opacity: {mounted ? '1' : '0'};"
		>
			<div class="relative mb-4 inline-block md:mb-6">
				<Icon
					icon={getUIIcon('dice')}
					class="mb-3 text-4xl transition-all duration-500 sm:text-5xl md:mb-4 md:text-6xl"
					style="color: {categoryColors.primary}; filter: drop-shadow(0 0 8px {categoryColors.glow});"
				/>
				<!-- Subtle rotating animation -->
				<div
					class="absolute inset-0 animate-pulse"
					style="background: radial-gradient(circle, {categoryColors.glow} 0%, transparent 70%); opacity: 0.3;"
				></div>
			</div>
			<h3 class="font-heading mb-2 text-xl md:text-2xl" style="color: #c9a876;">
				Ничего не найдено
			</h3>
			<p class="text-azaria-text/70 font-body mb-4 px-4 text-sm md:mb-6 md:text-base">
				Попробуйте изменить поисковый запрос или сбросить фильтры
			</p>
			<button
				on:click={() => (searchQuery = '')}
				class="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:scale-105 md:px-6 md:py-3 md:text-base"
				style="
					border: 2px solid {categoryColors.border};
					color: {categoryColors.primary};
					background: {categoryColors.bg};
					box-shadow: 0 0 10px {categoryColors.glow}60;
				"
			>
				Сбросить поиск
			</button>
		</div>
	{/if}
</div>
