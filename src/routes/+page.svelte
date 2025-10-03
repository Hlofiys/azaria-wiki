<script>
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { goto } from '$app/navigation';
	
	export let data;
	
	let isSpinning = false;
	let slotResults = [];
	
	// Slot machine functionality
	async function spinSlotMachine() {
		if (isSpinning) return;
		
		isSpinning = true;
		slotResults = [];
		
		// Simulate spinning animation
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// Select 3 random entries
		const shuffled = [...data.slotMachineEntries].sort(() => Math.random() - 0.5);
		slotResults = shuffled.slice(0, 3);
		
		isSpinning = false;
	}
	
	// Quick navigation to categories
	const categories = [
		{ name: 'characters', title: 'Персонажи', icon: '👑', description: 'Влиятельные личности' },
		{ name: 'locations', title: 'Локации', icon: '🏰', description: 'Города и места' },
		{ name: 'factions', title: 'Фракции', icon: '⚔️', description: 'Государства и организации' },
		{ name: 'artifacts', title: 'Артефакты', icon: '✨', description: 'Магические предметы' },
		{ name: 'concepts', title: 'Концепции', icon: '🎯', description: 'Философии и принципы' },
		{ name: 'creatures', title: 'Существа', icon: '🐉', description: 'Монстры и создания' }
	];
</script>

<svelte:head>
	<title>Азария Вики — Медивал-деп-панк вселенная</title>
	<meta name="description" content="Исследуйте мир Азарии - уникальную медивал-деп-панк вселенную, где средневековье встречается с философией азарта и удачи." />
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Hero Section -->
	<div class="text-center mb-12">
		<h1 class="text-5xl md:text-7xl font-heading text-azaria-gold mb-6">
			🎰 Добро пожаловать в Азарию
		</h1>
		<p class="text-xl md:text-2xl text-azaria-text/80 font-body max-w-3xl mx-auto mb-8">
			Погрузитесь в мир, где средневековье встречается с философией азарта, 
			где удача правит королевствами, а деп становится искусством.
		</p>
		<div class="flex flex-wrap justify-center gap-4 text-sm text-azaria-text/60">
			<span>📖 {data.totalEntries} статей</span>
			<span>👑 Персонажи</span>
			<span>🏰 Локации</span>
			<span>⚔️ Фракции</span>
			<span>✨ Артефакты</span>
		</div>
	</div>
	
	<!-- Slot Machine of Fate -->
	<div class="card bg-azaria-content border-2 border-azaria-gold ornate-border mb-12">
		<div class="card-body text-center">
			<h2 class="text-3xl font-heading text-azaria-gold mb-4">
				🎰 Слот-машина Судьбы
			</h2>
			<p class="text-azaria-text/80 font-body mb-6">
				Позвольте случайности выбрать ваше следующее приключение в мире Азарии
			</p>
			
			<!-- Slot Machine Reels -->
			<div class="flex justify-center items-center space-x-4 mb-6">
				{#each [0, 1, 2] as reelIndex}
					<div class="w-32 h-40 bg-azaria-dark border-2 border-azaria-gold rounded-lg flex flex-col justify-center items-center p-2">
						{#if isSpinning}
							<div class="loading-dice text-4xl mb-2">🎲</div>
							<div class="text-xs text-azaria-text/50 animate-pulse">Крутится...</div>
						{:else if slotResults[reelIndex]}
							<div class="text-2xl mb-1">
								{slotResults[reelIndex].category === 'characters' ? '👑' :
								 slotResults[reelIndex].category === 'locations' ? '🏰' :
								 slotResults[reelIndex].category === 'factions' ? '⚔️' :
								 slotResults[reelIndex].category === 'artifacts' ? '✨' :
								 slotResults[reelIndex].category === 'concepts' ? '🎯' :
								 slotResults[reelIndex].category === 'creatures' ? '🐉' : '📖'}
							</div>
							<div class="text-xs text-azaria-gold font-semibold text-center">
								{slotResults[reelIndex].title}
							</div>
						{:else}
							<div class="text-4xl mb-2">❓</div>
							<div class="text-xs text-azaria-text/50">Готов к спину</div>
						{/if}
					</div>
				{/each}
			</div>
			
			<!-- Spin Button -->
			<button 
				on:click={spinSlotMachine}
				disabled={isSpinning}
				class="btn btn-primary btn-lg text-lg font-heading px-8"
				class:loading={isSpinning}
			>
				{isSpinning ? '🎲 Крутится...' : '🎰 Спинануть судьбу!'}
			</button>
			
			<!-- Slot Results -->
			{#if slotResults.length > 0 && !isSpinning}
				<div class="mt-8">
					<h3 class="text-xl font-heading text-azaria-gold mb-4">
						✨ Судьба выбрала для вас:
					</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
						{#each slotResults as entry}
							<LoreCard {entry} showCategory={true} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Category Navigation -->
	<div class="mb-12">
		<h2 class="text-3xl font-heading text-azaria-gold mb-6 text-center">
			📚 Исследуйте мир Азарии
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each categories as category}
				<a 
					href="/{category.name}"
					class="card bg-azaria-content hover:bg-azaria-content/80 border border-azaria-gold/30 hover:border-azaria-gold transition-all duration-300 hover:scale-105 hover:shadow-gold-glow"
				>
					<div class="card-body text-center">
						<div class="text-4xl mb-3">{category.icon}</div>
						<h3 class="text-xl font-heading text-azaria-gold mb-2">
							{category.title}
						</h3>
						<p class="text-azaria-text/70 font-body text-sm">
							{category.description}
						</p>
					</div>
				</a>
			{/each}
		</div>
	</div>
	
	<!-- Featured Entries -->
	<div class="mb-12">
		<h2 class="text-3xl font-heading text-azaria-gold mb-6 text-center">
			⭐ Избранные статьи
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.featuredEntries as entry}
				<LoreCard {entry} showCategory={true} />
			{/each}
		</div>
	</div>
	
	<!-- Call to Action -->
	<div class="text-center bg-azaria-content rounded-lg p-8 border border-azaria-gold/30">
		<h2 class="text-2xl font-heading text-azaria-gold mb-4">
			🎯 Готовы погрузиться в мир Азарии?
		</h2>
		<p class="text-azaria-text/80 font-body mb-6 max-w-2xl mx-auto">
			Откройте для себя богатую историю империй, познакомьтесь с легендарными персонажами, 
			изучите магические артефакты и понимайте философию удачи и депа.
		</p>
		<div class="flex flex-wrap justify-center gap-4">
			<a href="/characters" class="btn btn-outline border-azaria-gold text-azaria-gold hover:bg-azaria-gold hover:text-azaria-dark">
				👑 Начать с персонажей
			</a>
			<a href="/concepts" class="btn btn-outline border-azaria-gold text-azaria-gold hover:bg-azaria-gold hover:text-azaria-dark">
				🎯 Понять концепции
			</a>
		</div>
	</div>
</div>
