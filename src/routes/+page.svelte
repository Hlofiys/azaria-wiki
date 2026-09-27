<script lang="ts">
	import { Icon, getCategoryIcon, getUIIcon } from '$lib/icons';
	import { resolve } from '$app/paths';
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import SlotMachine from '$lib/components/ui/SlotMachine.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { CATEGORY_ORDER, categoryDescriptions, categoryNames } from '$lib/utils/categories';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let reducedMotion = $state(false);

	onMount(() => {
		reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	function scrollToSlotMachine() {
		document.getElementById('slot-machine')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<svelte:head>
	<title>Азария Вики — Медивал-деп-панк вселенная</title>
	<meta
		name="description"
		content="Гроссбух мира Азарии: персонажи, локации, фракции, артефакты, концепции и существа medieval-dep-punk вселенной."
	/>
</svelte:head>

<div class="flex flex-col gap-14 sm:gap-20">
	<!-- Hero -->
	<section class="grid items-center gap-10 pt-4 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
		<div class="seal">
			<p class="eyebrow">Гроссбух · {data.totalEntries} записей · 6 разделов</p>
			<h1 class="mt-4 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
				Добро пожаловать<br />в Азарию
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-relaxed text-parchment-dim">
				Мир, где средневековье встречается с философией азарта: здесь удача правит королевствами,
				долг — валюта, а деп становится искусством.
			</p>
			<div class="mt-7 flex flex-wrap items-center gap-3">
				<button type="button" class="btn btn--solid" onclick={scrollToSlotMachine}>
					<Icon icon={getUIIcon('slot')} width="15" />
					Испытать судьбу
				</button>
				<a href={resolve('/artifacts')} class="btn">
					<Icon icon={getUIIcon('scroll')} width="15" />
					Начать с артефактов
				</a>
			</div>
		</div>

		<!-- Rosette of seals -->
		<div class="relative mx-auto hidden aspect-square w-full max-w-sm lg:block" aria-hidden="true">
			<div
				class="absolute inset-0 rounded-full border border-line"
				style="background: radial-gradient(closest-side, rgb(201 168 118 / 0.05), transparent 75%)"
			></div>
			<div class="absolute inset-[18%] rounded-full border border-line"></div>
			<div class="absolute inset-[38%] rounded-full border border-line-strong"></div>
			<span
				class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-3xl text-brass"
			>
				❖
			</span>
			{#each CATEGORY_ORDER as category, index (category)}
				{@const angle = (index / CATEGORY_ORDER.length) * 360 - 90}
				<div
					class="absolute top-1/2 left-1/2"
					data-seal={category}
					style="transform: rotate({angle}deg) translateX(11.5rem) rotate({-angle}deg) translate(-50%, -50%);"
				>
					<div
						class="frame frame--quiet seal grid size-14 place-items-center bg-ink-850"
						style="border-color: var(--seal-line)"
					>
						<Icon icon={getCategoryIcon(category)} width="20" class="seal-text" />
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- Signature: the slot machine -->
	<SlotMachine entries={data.slotMachineEntries} {reducedMotion} total={data.totalEntries} />

	<!-- Sections -->
	<section id="sections" class="scroll-mt-24">
		<SectionHeading
			eyebrow="Оглавление"
			title="Разделы гроссбуха"
			align="center"
			icon={getUIIcon('library')}
		/>
		<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each CATEGORY_ORDER as category (category)}
				{@const count = data.categoryCounts[category] ?? 0}
				<a
					href={resolve(`/${category}` as `/${string}`)}
					data-seal={category}
					class="frame frame--link seal group flex flex-col p-5"
				>
					<div class="relative z-10 flex items-start justify-between gap-4">
						<span
							class="grid size-11 place-items-center border"
							style="border-color: var(--seal-line); background-color: var(--seal-tint)"
						>
							<Icon icon={getCategoryIcon(category)} width="20" class="seal-text" />
						</span>
						<span class="folio">{count}</span>
					</div>
					<h3
						class="relative z-10 mt-4 font-display text-xl text-parchment group-hover:text-brass-bright"
					>
						{categoryNames[category].plural}
					</h3>
					<p class="relative z-10 mt-1.5 text-sm text-parchment-mute">
						{categoryDescriptions[category]}
					</p>
					<span class="eyebrow relative z-10 mt-4 flex items-center gap-1.5">
						Открыть раздел
						<Icon
							icon={getUIIcon('arrow-right')}
							width="12"
							class="transition-transform group-hover:translate-x-0.5"
						/>
					</span>
				</a>
			{/each}
		</div>
	</section>

	<!-- Recently filed / most cited -->
	<section class="grid gap-10 lg:grid-cols-2 lg:gap-8">
		<div>
			<SectionHeading eyebrow="Поступления" title="Свежие записи" />
			<div class="@container mt-4 border-t border-line">
				{#each data.recentEntries as entry (entry.slug)}
					<LoreCard {entry} variant="ledger" showCategory />
				{/each}
			</div>
		</div>
		<div>
			<SectionHeading eyebrow="Наибольшее число ссылок" title="Самые цитируемые" />
			<div class="@container mt-4 border-t border-line">
				{#each data.topCited as entry (entry.slug)}
					<div class="flex items-baseline gap-3">
						<div class="min-w-0 flex-1">
							<LoreCard {entry} variant="ledger" showCategory />
						</div>
						<span class="folio shrink-0">{entry.citations}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Featured cross-section -->
	<section>
		<SectionHeading eyebrow="По одному из каждого раздела" title="Избранные статьи" />
		<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.featuredEntries as entry (entry.slug)}
				<LoreCard {entry} showCategory />
			{/each}
		</div>
	</section>

	<!-- Lore banner -->
	<section class="frame seal px-6 py-10 text-center sm:px-10">
		<div class="relative z-10">
			<p class="eyebrow">Из Книги Последнего Спина</p>
			<blockquote class="mx-auto mt-4 max-w-2xl font-display text-2xl leading-snug sm:text-3xl">
				«Лишь Золотой Спин или ретриггер Белбетовича может остановить это слияние.»
			</blockquote>
			<div class="mt-6 flex justify-center">
				<a href={resolve('/artifacts/zolotoy-spin')} class="btn">
					Читать о Золотом Спине
					<Icon icon={getUIIcon('arrow-right')} width="14" />
				</a>
			</div>
		</div>
	</section>
</div>
