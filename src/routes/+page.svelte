<script>
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { goto } from '$app/navigation';
	import { Icon, getCategoryIcon, getUIIcon, getCategoryColors } from '$lib/icons.js';
	
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
		{ name: 'characters', title: 'Персонажи', description: 'Влиятельные личности' },
		{ name: 'locations', title: 'Локации', description: 'Города и места' },
		{ name: 'factions', title: 'Фракции', description: 'Государства и организации' },
		{ name: 'artifacts', title: 'Артефакты', description: 'Магические предметы' },
		{ name: 'concepts', title: 'Концепции', description: 'Философии и принципы' },
		{ name: 'creatures', title: 'Существа', description: 'Монстры и создания' }
	];
</script>

<svelte:head>
	<title>Азария Вики — Медивал-деп-панк вселенная</title>
	<meta name="description" content="Исследуйте мир Азарии - уникальную медивал-деп-панк вселенную, где средневековье встречается с философией азарта и удачи." />
</svelte:head>

<div class="max-w-7xl mx-auto">
	<!-- Hero Section -->
	<div class="text-center mb-12 relative">
		<!-- Floating decorative particles -->
		<div class="absolute inset-0 overflow-hidden pointer-events-none">
			<div class="floating-particle absolute top-10 left-10 text-yellow-500 opacity-20" style="animation-delay: 0s;">✨</div>
			<div class="floating-particle absolute top-20 right-20 text-blue-500 opacity-20" style="animation-delay: 1s;">🏰</div>
			<div class="floating-particle absolute bottom-20 left-20 text-red-500 opacity-20" style="animation-delay: 2s;">⚔️</div>
			<div class="floating-particle absolute bottom-10 right-10 text-purple-500 opacity-20" style="animation-delay: 3s;">🔮</div>
		</div>
		
		<h1 class="text-5xl md:text-7xl font-heading text-azaria-gold mb-6 relative z-10">
			<Icon icon={getUIIcon('slot')} class="inline mr-4 icon-bounce gentle-glow" style="vertical-align: middle;" />
			Добро пожаловать в Азарию
		</h1>
		<p class="text-xl md:text-2xl text-azaria-text/80 font-body max-w-3xl mx-auto mb-8 relative z-10">
			Погрузитесь в мир, где средневековье встречается с философией азарта, 
			где удача правит королевствами, а деп становится искусством.
		</p>
		<div class="flex flex-wrap justify-center gap-4 text-sm text-azaria-text/60 relative z-10">
			<span class="icon-bounce"><Icon icon={getUIIcon('book')} class="inline mr-1" /> {data.totalEntries} статей</span>
			<span class="icon-bounce"><Icon icon={getCategoryIcon('characters')} class="inline mr-1" style="color: #FFD700;" /> Персонажи</span>
			<span class="icon-bounce"><Icon icon={getCategoryIcon('locations')} class="inline mr-1" style="color: #5DADE2;" /> Локации</span>
			<span class="icon-bounce"><Icon icon={getCategoryIcon('factions')} class="inline mr-1" style="color: #E74C3C;" /> Фракции</span>
			<span class="icon-bounce"><Icon icon={getCategoryIcon('artifacts')} class="inline mr-1" style="color: #AF7AC5;" /> Артефакты</span>
		</div>
	</div>
	
	<!-- Slot Machine of Fate -->
	<div class="relative overflow-hidden rounded-lg mb-12" style="background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%); border: 2px solid #FFD700; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 15px rgba(255, 215, 0, 0.3);">
		<div class="p-8 text-center relative z-10">
			<h2 class="text-3xl font-heading text-azaria-gold mb-4">
				<Icon icon={getUIIcon('slot')} class="inline mr-2" style="vertical-align: middle;" />
				Слот-машина Судьбы
			</h2>
			<p class="text-azaria-text/80 font-body mb-6">
				Позвольте случайности выбрать ваше следующее приключение в мире Азарии
			</p>
			
			<!-- Slot Machine Reels -->
			<div class="flex justify-center items-center space-x-4 mb-6">
				{#each [0, 1, 2] as reelIndex}
					{@const resultColors = slotResults[reelIndex] ? getCategoryColors(slotResults[reelIndex].category) : null}
					<div 
						class="w-32 h-40 rounded-lg flex flex-col justify-center items-center p-2 relative overflow-hidden transition-all duration-300"
						style="
							background: linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%);
							border: 2px solid {resultColors ? resultColors.border : '#FFD700'};
							box-shadow: 0 0 15px {resultColors ? resultColors.glow : 'rgba(255, 215, 0, 0.3)'};
						"
					>
						{#if resultColors}
							<!-- Category background glow -->
							<div 
								class="absolute inset-0 opacity-20"
								style="background: radial-gradient(circle, {resultColors.bg} 0%, transparent 70%);"
							></div>
						{/if}
						
						<div class="relative z-10">
							{#if isSpinning}
								<div class="relative">
									<Icon 
										icon={getUIIcon('dice')} 
										class="text-4xl mb-2 animate-spin" 
										style="color: #FFD700; filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));"
									/>
									<!-- Spinning blur effect -->
									<div class="absolute inset-0 animate-pulse" style="background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);"></div>
								</div>
								<div class="text-xs text-azaria-text/50 animate-pulse">Крутится...</div>
							{:else if slotResults[reelIndex]}
								<div class="relative">
									<Icon 
										icon={getCategoryIcon(slotResults[reelIndex].category)} 
										class="text-3xl mb-2 icon-bounce gentle-glow" 
										style="color: {resultColors.primary}; filter: drop-shadow(0 0 8px {resultColors.glow});"
									/>
									<!-- Victory sparkle effect -->
									<div class="absolute -top-1 -right-1 text-yellow-300 opacity-75 animate-ping">✨</div>
								</div>
								<div class="text-xs font-semibold text-center px-1 fade-in-up" style="color: {resultColors.primary};">
									{slotResults[reelIndex].title}
								</div>
							{:else}
								<Icon 
									icon={getUIIcon('question')} 
									class="text-4xl mb-2 opacity-50 pulse-glow" 
									style="color: #666;"
								/>
								<div class="text-xs text-azaria-text/50">Готов к спину</div>
							{/if}
						</div>
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
				{#if isSpinning}
					<Icon icon={getUIIcon('dice')} class="inline mr-2" />
					Крутится...
				{:else}
					<Icon icon={getUIIcon('slot')} class="inline mr-2" />
					Спинануть судьбу!
				{/if}
			</button>
			
			<!-- Slot Results -->
			{#if slotResults.length > 0 && !isSpinning}
				<div class="mt-8">
					<h3 class="text-xl font-heading text-azaria-gold mb-4">
						<Icon icon={getCategoryIcon('artifacts')} class="inline mr-2" />
						Судьба выбрала для вас:
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
			<Icon icon={getUIIcon('library')} class="inline mr-2" />
			Исследуйте мир Азарии
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each categories as category}
				{@const colors = getCategoryColors(category.name)}
				<a 
					href="/{category.name}"
					class="relative overflow-hidden group transition-all duration-300 hover:scale-105 rounded-lg"
					style="
						background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
						border: 2px solid {colors.border}50;
						box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 8px {colors.glow}40;
					"
				>
					<!-- Animated background gradient -->
					<div 
						class="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
						style="background: linear-gradient(135deg, {colors.bg} 0%, transparent 30%, {colors.bg} 70%, transparent 100%);"
					></div>
					
					<!-- Glowing border effect on hover -->
					<div 
						class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"
						style="box-shadow: inset 0 0 20px {colors.glow};"
					></div>
					
					<div class="p-6 text-center relative z-10">
						<Icon 
							icon={getCategoryIcon(category.name)} 
							class="text-4xl mb-3 transition-all duration-300 group-hover:scale-110" 
							style="color: {colors.primary}; filter: drop-shadow(0 0 8px {colors.glow});"
						/>
						<h3 class="text-xl font-heading mb-2 transition-all duration-300" style="color: {colors.primary}; text-shadow: 0 0 4px {colors.glow};">
							{category.title}
						</h3>
						<p class="text-azaria-text/70 font-body text-sm group-hover:text-azaria-text/90 transition-colors duration-300">
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
			<Icon icon={getUIIcon('star')} class="inline mr-2" />
			Избранные статьи
		</h2>
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each data.featuredEntries as entry}
				<LoreCard {entry} showCategory={true} />
			{/each}
		</div>
	</div>
	
	<!-- Call to Action -->
	<div class="text-center rounded-lg p-8 relative overflow-hidden" style="background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%); border: 2px solid #FFD70050; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 8px rgba(255, 215, 0, 0.2);">
		<!-- Subtle background effect -->
		<div class="absolute inset-0 opacity-5" style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, transparent 50%, rgba(255, 215, 0, 0.1) 100%);"></div>
		
		<div class="relative z-10">
			<h2 class="text-2xl font-heading text-azaria-gold mb-4" style="text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);">
				<Icon icon={getCategoryIcon('concepts')} class="inline mr-2" style="color: #FFD700;" />
				Готовы погрузиться в мир Азарии?
			</h2>
			<p class="text-azaria-text/80 font-body mb-6 max-w-2xl mx-auto">
				Откройте для себя богатую историю империй, познакомьтесь с легендарными персонажами, 
				изучите магические артефакты и понимайте философию удачи и депа.
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				{#each [
					{ href: '/characters', category: 'characters', label: 'Начать с персонажей' },
					{ href: '/concepts', category: 'concepts', label: 'Понять концепции' }
				] as button}
					{@const colors = getCategoryColors(button.category)}
					<a 
						href={button.href} 
						class="inline-block px-6 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
						style="
							border: 2px solid {colors.border};
							color: {colors.primary};
							background: {colors.bg};
							box-shadow: 0 0 10px {colors.glow};
							text-decoration: none;
						"
					>
						<Icon icon={getCategoryIcon(button.category)} class="inline mr-2" style="color: {colors.primary};" />
						{button.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
