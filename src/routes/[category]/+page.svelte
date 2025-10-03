<script>
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { page } from '$app/stores';
	
	export let data;
	
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
		<h1 class="text-4xl md:text-5xl font-heading text-azaria-gold mb-4">
			{data.categoryInfo.icon} {data.categoryInfo.title}
		</h1>
		<p class="text-xl text-azaria-text/80 font-body max-w-2xl mx-auto">
			{data.categoryInfo.description}
		</p>
		<div class="mt-4 text-sm text-azaria-text/60">
			Всего записей: {data.entries.length}
		</div>
	</div>
	
	<!-- Search and Filter Controls -->
	<div class="card bg-azaria-content border border-azaria-gold/30 mb-8">
		<div class="card-body">
			<div class="flex flex-col md:flex-row gap-4 items-center">
				<!-- Search -->
				<div class="flex-1">
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Поиск по названию, фракции, типу..."
						class="input input-bordered w-full bg-azaria-dark text-azaria-text border-azaria-gold/50 focus:border-azaria-gold"
					/>
				</div>
				
				<!-- Sort -->
				<div class="flex items-center space-x-2">
					<label class="text-azaria-text font-body">Сортировка:</label>
					<select bind:value={sortBy} class="select select-bordered bg-azaria-dark text-azaria-text border-azaria-gold/50">
						<option value="title">По названию</option>
						<option value="faction">По фракции</option>
						<option value="type">По типу</option>
					</select>
				</div>
				
				<!-- Results Count -->
				<div class="text-sm text-azaria-text/70">
					Показано: {filteredEntries.length} из {data.entries.length}
				</div>
			</div>
		</div>
	</div>
	
	<!-- Entries Grid -->
	{#if filteredEntries.length > 0}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each filteredEntries as entry}
				<LoreCard {entry} showCategory={false} />
			{/each}
		</div>
	{:else}
		<div class="text-center py-12">
			<div class="text-6xl mb-4">🎲</div>
			<h3 class="text-2xl font-heading text-azaria-gold mb-2">
				Ничего не найдено
			</h3>
			<p class="text-azaria-text/70 font-body">
				Попробуйте изменить поисковый запрос или сбросить фильтры
			</p>
			<button 
				on:click={() => searchQuery = ''}
				class="btn btn-outline border-azaria-gold text-azaria-gold mt-4"
			>
				Сбросить поиск
			</button>
		</div>
	{/if}
</div>