<script lang="ts">
	import LazyLoreCard from '$lib/components/lazy/LazyLoreCard.svelte';
	import { Icon, getCategoryIcon, getUIIcon, getCategoryColors } from '$lib/icons';
	import { resolve } from '$app/paths';
	import type { EntryListItem } from '$lib/server/lore-parser';
	import type { CategoryType } from '$lib/icons';
	import type { PageData } from './$types';
	import LoadingAnimations from '$lib/components/ui/LoadingAnimations.svelte';
	import { onMount } from 'svelte';

	export let data: PageData;

	let isSpinning = false;
	let slotResults: EntryListItem[] = [];
	let isLoaded = false;

	onMount(() => {
		// Trigger loading animation
		setTimeout(() => {
			isLoaded = true;
		}, 200);
	});

	// Slot machine functionality
	async function spinSlotMachine() {
		if (isSpinning) return;

		isSpinning = true;
		slotResults = [];

		// Simulate spinning animation
		await new Promise((resolve) => setTimeout(resolve, 2000));

		// Select 3 random entries
		const shuffled = [...data.slotMachineEntries].sort(() => Math.random() - 0.5);
		slotResults = shuffled.slice(0, 3);

		isSpinning = false;
	}

	// Quick navigation to categories
	const categories: Array<{ name: CategoryType; title: string; description: string }> = [
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
	<meta
		name="description"
		content="Исследуйте мир Азарии - уникальную медивал-деп-панк вселенную, где средневековье встречается с философией азарта и удачи."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl">
	<!-- Hero Section -->
	<LoadingAnimations type="fade" delay={0} show={isLoaded}>
		<div class="relative mb-12 text-center">
			<!-- Floating decorative particles -->
			<div class="pointer-events-none absolute inset-0 overflow-hidden">
				<div
					class="floating-particle absolute top-10 left-10 text-yellow-500 opacity-20"
					style="animation-delay: 0s;"
				>
					✨
				</div>
				<div
					class="floating-particle absolute top-20 right-20 text-blue-500 opacity-20"
					style="animation-delay: 1s;"
				>
					🏰
				</div>
				<div
					class="floating-particle absolute bottom-20 left-20 text-red-500 opacity-20"
					style="animation-delay: 2s;"
				>
					⚔️
				</div>
				<div
					class="floating-particle absolute right-10 bottom-10 text-purple-500 opacity-20"
					style="animation-delay: 3s;"
				>
					🔮
				</div>
			</div>

			<h1
				class="font-heading text-azaria-gold relative z-10 mb-4 text-center text-3xl sm:text-4xl md:mb-6 md:text-5xl lg:text-7xl"
			>
				<div class="flex flex-col items-center justify-center gap-2 sm:flex-row md:gap-4">
					<Icon
						icon={getUIIcon('slot')}
						class="icon-bounce gentle-glow"
						style="vertical-align: middle;"
					/>
					<span>Добро пожаловать в Азарию</span>
				</div>
			</h1>
			<p
				class="text-azaria-text/80 font-body relative z-10 mx-auto mb-6 max-w-3xl px-4 text-center text-lg md:mb-8 md:text-xl lg:text-2xl"
			>
				Погрузитесь в мир, где средневековье встречается с философией азарта, где удача правит
				королевствами, а деп становится искусством.
			</p>
			<div
				class="text-azaria-text/60 relative z-10 flex flex-wrap justify-center gap-2 px-4 text-xs md:gap-4 md:text-sm"
			>
				<span class="icon-bounce"
					><Icon icon={getUIIcon('book')} class="mr-1 inline" /> {data.totalEntries} статей</span
				>
				<span class="icon-bounce"
					><Icon icon={getCategoryIcon('characters')} class="mr-1 inline" style="color: #FFD700;" />
					Персонажи</span
				>
				<span class="icon-bounce"
					><Icon icon={getCategoryIcon('locations')} class="mr-1 inline" style="color: #5DADE2;" /> Локации</span
				>
				<span class="icon-bounce"
					><Icon icon={getCategoryIcon('factions')} class="mr-1 inline" style="color: #E74C3C;" /> Фракции</span
				>
				<span class="icon-bounce"
					><Icon icon={getCategoryIcon('artifacts')} class="mr-1 inline" style="color: #AF7AC5;" /> Артефакты</span
				>
			</div>
		</div>
	</LoadingAnimations>

	<!-- Slot Machine of Fate -->
	<div class="azaria-panel relative mb-8 overflow-hidden rounded-lg md:mb-12">
		<div class="relative z-10 p-4 text-center md:p-8">
			<h2 class="font-heading text-azaria-gold mb-3 text-xl md:mb-4 md:text-2xl lg:text-3xl">
				<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
					<Icon icon={getUIIcon('slot')} style="vertical-align: middle;" />
					<span>Слот-машина Судьбы</span>
				</div>
			</h2>
			<p class="text-azaria-text/80 font-body mb-4 px-2 text-sm md:mb-6 md:text-base">
				Позвольте случайности выбрать ваше следующее приключение в мире Азарии
			</p>

			<!-- Slot Machine Reels -->
			<div class="mb-4 flex items-center justify-center space-x-2 md:mb-6 md:space-x-4">
				{#each [0, 1, 2] as reelIndex (reelIndex)}
					{@const resultColors = slotResults[reelIndex]
						? getCategoryColors(slotResults[reelIndex].category)
						: getCategoryColors('characters')}
					<div
						class="relative flex h-24 w-20 flex-col items-center justify-center overflow-hidden rounded-xl p-1 transition-all duration-300 sm:h-32 sm:w-24 md:h-40 md:w-32 md:p-2"
						style="
							background:
								linear-gradient(145deg, #1a1a1a 0%, #2a2a2a 100%),
								radial-gradient(ellipse at center, rgba(201, 168, 118, 0.1) 0%, transparent 70%);
							border: 2px solid {resultColors ? resultColors.border + 'DD' : 'rgba(201, 168, 118, 0.8)'};
							box-shadow:
								0 0 20px {resultColors ? resultColors.glow + '50' : 'rgba(201, 168, 118, 0.3)'},
								0 4px 8px rgba(0, 0, 0, 0.5);
						"
					>
						{#if resultColors}
							<!-- Category background glow -->
							<div
								class="absolute inset-0 opacity-20"
								style="background: radial-gradient(circle, {resultColors.bg} 0%, transparent 70%);"
							></div>
						{/if}

						<div class="relative z-10 flex h-full flex-col items-center justify-center">
							{#if isSpinning}
								<div class="relative flex flex-col items-center">
									<Icon
										icon={getUIIcon('dice')}
										class="mb-1 animate-spin text-2xl sm:text-3xl md:mb-2 md:text-4xl"
										style="color: #FFD700; filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.8));"
									/>
									<!-- Spinning blur effect -->
									<div
										class="absolute inset-0 animate-pulse"
										style="background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);"
									></div>
								</div>
								<div class="text-azaria-text/50 hidden animate-pulse text-center text-xs sm:block">
									Крутится...
								</div>
							{:else if slotResults[reelIndex]}
								{@const colors = getCategoryColors(slotResults[reelIndex].category)}
								<div class="relative flex flex-col items-center">
									<Icon
										icon={getCategoryIcon(slotResults[reelIndex].category)}
										class="icon-bounce gentle-glow mb-1 text-xl sm:text-2xl md:mb-2 md:text-3xl"
										style="color: {colors.primary}; filter: drop-shadow(0 0 8px {colors.glow});"
									/>
									<!-- Victory sparkle effect -->
									<div
										class="absolute -top-1 -right-1 animate-ping text-xs text-yellow-300 opacity-75"
									>
										✨
									</div>
								</div>
								<div
									class="fade-in-up px-1 text-center text-xs leading-tight font-semibold"
									style="color: {colors.primary}; max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; hyphens: auto; line-height: 1.2;"
								>
									{slotResults[reelIndex].title}
								</div>
							{:else}
								<div class="flex flex-col items-center">
									<Icon
										icon={getUIIcon('question')}
										class="pulse-glow mb-1 text-2xl opacity-50 sm:text-3xl md:mb-2 md:text-4xl"
										style="color: #666;"
									/>
									<div class="text-azaria-text/50 hidden text-center text-xs sm:block">Готов</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>

			<!-- Spin Button -->
			<button
				on:click={spinSlotMachine}
				disabled={isSpinning}
				class="azaria-btn font-heading px-4 py-2 text-sm md:px-6 md:py-3 md:text-base lg:px-8 lg:text-lg"
				class:loading={isSpinning}
			>
				{#if isSpinning}
					<Icon icon={getUIIcon('dice')} class="mr-1 inline md:mr-2" />
					Крутится...
				{:else}
					<Icon icon={getUIIcon('slot')} class="mr-1 inline md:mr-2" />
					Спинануть судьбу!
				{/if}
			</button>

			<!-- Slot Results -->
			{#if slotResults.length > 0 && !isSpinning}
				<div class="mt-6 md:mt-8">
					<h3 class="font-heading text-azaria-gold mb-3 text-lg md:mb-4 md:text-xl">
						<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
							<Icon icon={getCategoryIcon('artifacts')} />
							<span>Судьба выбрала для вас:</span>
						</div>
					</h3>
					<div class="grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
						{#each slotResults as entry (entry.slug)}
							<LazyLoreCard {entry} showCategory={true} />
						{/each}
					</div>
				</div>
			{/if}
		</div>
	</div>

	<!-- Category Navigation -->
	<div class="mb-8 md:mb-12">
		<h2 class="font-heading text-azaria-gold mb-4 text-center text-2xl md:mb-6 md:text-3xl">
			<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
				<Icon icon={getUIIcon('library')} />
				<span>Исследуйте мир Азарии</span>
			</div>
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
			{#each categories as category, index (category.name)}
				{@const colors = getCategoryColors(category.name)}
				<LoadingAnimations type="slide" delay={index * 150} show={isLoaded}>
					<div
						class="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105"
						style="
							background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
							border: 2px solid {colors.border}50;
							box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 8px {colors.glow}40;
						"
					>
						<a href={resolve(`/${category.name}` as `/${string}`)} class="block h-full w-full">
							<!-- Animated background gradient -->
							<div
								class="absolute inset-0 opacity-10 transition-opacity duration-500 group-hover:opacity-20"
								style="background: linear-gradient(135deg, {colors.bg} 0%, transparent 30%, {colors.bg} 70%, transparent 100%);"
							></div>

							<!-- Glowing border effect on hover -->
							<div
								class="absolute inset-0 rounded-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								style="box-shadow: inset 0 0 20px {colors.glow};"
							></div>

							<div class="relative z-10 p-4 text-center md:p-6">
								<Icon
									icon={getCategoryIcon(category.name)}
									class="mb-2 text-3xl transition-all duration-300 group-hover:scale-110 md:mb-3 md:text-4xl"
									style="color: {colors.primary}; filter: drop-shadow(0 0 8px {colors.glow});"
								/>
								<h3
									class="font-heading mb-2 text-lg transition-all duration-300 md:text-xl"
									style="color: {colors.primary}; text-shadow: 0 0 4px {colors.glow};"
								>
									{category.title}
								</h3>
								<p
									class="text-azaria-text/70 font-body group-hover:text-azaria-text/90 text-sm transition-colors duration-300"
								>
									{category.description}
								</p>
							</div></a
						>
					</div>
				</LoadingAnimations>
			{/each}
		</div>
	</div>

	<!-- Featured Entries -->
	<div class="mb-8 md:mb-12">
		<h2 class="font-heading text-azaria-gold mb-4 text-center text-2xl md:mb-6 md:text-3xl">
			<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
				<Icon icon={getUIIcon('star')} />
				<span>Избранные статьи</span>
			</div>
		</h2>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
			{#each data.featuredEntries as entry, index (entry.slug)}
				<LoadingAnimations type="fade" delay={600 + index * 200} show={isLoaded}>
					<LoreCard {entry} showCategory={true} />
				</LoadingAnimations>
			{/each}
		</div>
	</div>

	<!-- Call to Action -->
	<div
		class="relative overflow-hidden rounded-lg p-4 text-center md:p-8"
		style="background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%); border: 1px solid rgba(255, 215, 0, 0.3); box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 4px rgba(255, 215, 0, 0.1);"
	>
		<!-- Subtle background effect -->
		<div
			class="absolute inset-0 opacity-3"
			style="background: linear-gradient(135deg, rgba(255, 215, 0, 0.05) 0%, transparent 50%, rgba(255, 215, 0, 0.05) 100%);"
		></div>

		<div class="relative z-10">
			<h2
				class="font-heading text-azaria-gold mb-3 text-xl md:mb-4 md:text-2xl"
				style="text-shadow: 0 0 6px rgba(255, 215, 0, 0.3);"
			>
				<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
					<Icon icon={getCategoryIcon('concepts')} style="color: #FFD700;" />
					<span>Готовы погрузиться в мир Азарии?</span>
				</div>
			</h2>
			<p
				class="text-azaria-text/80 font-body mx-auto mb-4 max-w-2xl px-4 text-sm md:mb-6 md:text-base"
			>
				Откройте для себя богатую историю империй, познакомьтесь с легендарными персонажами, изучите
				магические артефакты и понимайте философию удачи и депа.
			</p>
			<div class="flex flex-col flex-wrap justify-center gap-3 px-4 sm:flex-row md:gap-4">
				{#each [{ href: '/characters', category: 'characters' as CategoryType, label: 'Начать с персонажей' }, { href: '/concepts', category: 'concepts' as CategoryType, label: 'Понять концепции' }] as button (button.href)}
					{@const colors = getCategoryColors(button.category)}
					<a
						href={resolve(button.href as `/${string}`)}
						class="azaria-btn text-sm md:text-base"
						style="
							border-color: {colors.border};
							box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4), 0 0 6px {colors.glow};
						"
					>
						<Icon
							icon={getCategoryIcon(button.category)}
							class="mr-1 inline md:mr-2"
							style="color: {colors.primary};"
						/>
						{button.label}
					</a>
				{/each}
			</div>
		</div>
	</div>
</div>
