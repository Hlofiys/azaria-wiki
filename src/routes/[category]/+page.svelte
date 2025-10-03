<script>
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { page } from '$app/stores';
	import { Icon, getCategoryIcon, getUIIcon, getCategoryColors } from '$lib/icons.js';
	import { onMount } from 'svelte';
	
	export let data;
	
	let mounted = false;
	
	onMount(() => {
		mounted = true;
	});
	
	$: categoryColors = getCategoryColors($page.params.category);
	
	let searchQuery = '';
	let sortBy = 'title';
	let filteredEntries = data.entries;
	
	// Reactive filtering and sorting
	$: {
		let entries = data.entries;
		
		// Filter by search query
		if (searchQuery.trim()) {
			const query = searchQuery.toLowerCase();
			entries = entries.filter(entry => 
				entry.title.toLowerCase().includes(query) ||
				(entry.faction && entry.faction.toLowerCase().includes(query)) ||
				(entry.type && entry.type.toLowerCase().includes(query)) ||
				(entry.tags && entry.tags.some(tag => tag.toLowerCase().includes(query)))
			);
		}
		
		// Sort entries
		entries = entries.sort((a, b) => {
			switch (sortBy) {
				case 'title':
					return a.title.localeCompare(b.title, 'ru');
				case 'faction':
					return (a.faction || '').localeCompare(b.faction || '', 'ru');
				case 'type':
					return (a.type || '').localeCompare(b.type || '', 'ru');
				default:
					return 0;
			}
		});
		
		filteredEntries = entries;
	}
</script>

<svelte:head>
	<title>{data.categoryInfo.title} — Азария Вики</title>
	<meta name="description" content="{data.categoryInfo.description}" />
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Category Header -->
	<div class="text-center mb-8">
		<div 
			class="inline-block transition-all duration-1000 ease-out"
			style="transform: {mounted ? 'translateY(0)' : 'translateY(-20px)'}; opacity: {mounted ? '1' : '0'};"
		>
			<h1 class="text-4xl md:text-5xl font-heading mb-4" style="color: #c9a876; text-shadow: 0 0 8px rgba(201, 168, 118, 0.4);">
				<Icon 
					icon={getCategoryIcon($page.params.category)} 
					class="inline mr-3 transition-all duration-500" 
					style="color: {categoryColors.primary}; filter: drop-shadow(0 0 8px {categoryColors.glow});"
				/>
				{data.categoryInfo.title}
			</h1>
		</div>
		<p 
			class="text-xl text-azaria-text/80 font-body max-w-2xl mx-auto transition-all duration-1000 ease-out delay-200"
			style="transform: {mounted ? 'translateY(0)' : 'translateY(20px)'}; opacity: {mounted ? '1' : '0'};"
		>
			{data.categoryInfo.description}
		</p>
		<div 
			class="mt-4 text-sm text-azaria-text/60 transition-all duration-1000 ease-out delay-400"
			style="opacity: {mounted ? '1' : '0'};"
		>
			<span class="inline-block px-3 py-1 rounded-full" style="background: {categoryColors.bg}; border: 1px solid {categoryColors.border}50; color: {categoryColors.secondary};">
				Всего записей: {data.entries.length}
			</span>
		</div>
	</div>
	
	<!-- Search and Filter Controls -->
	<div 
		class="rounded-lg mb-8 transition-all duration-1000 ease-out delay-600 relative overflow-hidden"
		style="
			background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
			border: 1px solid rgba(201, 168, 118, 0.3);
			transform: {mounted ? 'translateY(0)' : 'translateY(20px)'};
			opacity: {mounted ? '1' : '0'};
		"
	>
		<!-- Subtle category accent -->
		<div 
			class="absolute top-0 left-0 w-full h-1"
			style="background: linear-gradient(90deg, {categoryColors.primary} 0%, transparent 100%);"
		></div>
		
		<div class="p-6">
			<div class="flex flex-col md:flex-row gap-4 items-center">
				<!-- Search -->
				<div class="flex-1">
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Поиск по названию, фракции, типу..."
						class="w-full px-4 py-2 rounded-lg border transition-all duration-300"
						style="
							background: #1a1a1a;
							color: #d0d0d0;
							border-color: rgba(201, 168, 118, 0.3);
						"
						on:focus={(e) => e.target.style.borderColor = categoryColors.border}
						on:blur={(e) => e.target.style.borderColor = 'rgba(201, 168, 118, 0.3)'}
					/>
				</div>
				
				<!-- Sort -->
				<div class="flex items-center space-x-2">
					<label class="text-azaria-text font-body">Сортировка:</label>
					<select 
						bind:value={sortBy} 
						class="px-3 py-2 rounded-lg border transition-colors duration-300"
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
				<div class="text-sm px-3 py-1 rounded-full" style="background: {categoryColors.bg}; color: {categoryColors.secondary};">
					Показано: {filteredEntries.length} из {data.entries.length}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Entries Grid -->
	{#if filteredEntries.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredEntries as entry, index}
				<div
					class="transition-all duration-700 ease-out"
					style="
						transform: {mounted ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.9)'};
						opacity: {mounted ? '1' : '0'};
						transition-delay: {800 + (index * 100)}ms;
					"
				>
					<LoreCard {entry} showCategory={false} />
				</div>
			{/each}
		</div>
	{:else}
		<div 
			class="text-center py-12 transition-all duration-1000 ease-out delay-800"
			style="opacity: {mounted ? '1' : '0'};"
		>
			<div class="relative inline-block mb-6">
				<Icon 
					icon={getUIIcon('dice')} 
					class="text-6xl mb-4 transition-all duration-500" 
					style="color: {categoryColors.primary}; filter: drop-shadow(0 0 8px {categoryColors.glow});"
				/>
				<!-- Subtle rotating animation -->
				<div 
					class="absolute inset-0 animate-pulse"
					style="background: radial-gradient(circle, {categoryColors.glow} 0%, transparent 70%); opacity: 0.3;"
				></div>
			</div>
			<h3 class="text-2xl font-heading mb-2" style="color: #c9a876;">
				Ничего не найдено
			</h3>
			<p class="text-azaria-text/70 font-body mb-6">
				Попробуйте изменить поисковый запрос или сбросить фильтры
			</p>
			<button 
				on:click={() => searchQuery = ''}
				class="px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
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