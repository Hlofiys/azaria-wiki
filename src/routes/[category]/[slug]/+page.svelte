<script lang="ts">
	import Dossier from '$lib/components/ui/Dossier.svelte';
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import Stamp from '$lib/components/ui/Stamp.svelte';
	import Tag from '$lib/components/ui/Tag.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import { Icon, getCategoryIcon, getUIIcon } from '$lib/icons';
	import {
		entryFolio,
		getCategoryName,
		getCategorySectionLabel,
		type CategoryType
	} from '$lib/utils/categories';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const category = $derived(data.entry.metadata.category as CategoryType);
	const folio = $derived(entryFolio(category, data.entry.metadata.slug));
	const status = $derived(
		typeof data.entry.metadata.status === 'string' ? data.entry.metadata.status : ''
	);
	const isShortStatus = $derived(status.length > 0 && status.length <= 26 && !status.includes('—'));

	const index = $derived(data.siblings.findIndex((item) => item.slug === data.entry.metadata.slug));
	const previous = $derived(index > 0 ? data.siblings[index - 1] : null);
	const next = $derived(
		index >= 0 && index < data.siblings.length - 1 ? data.siblings[index + 1] : null
	);

	const updated = $derived(
		data.entry.metadata.updated
			? new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(
					new Date(data.entry.metadata.updated)
				)
			: ''
	);

	let activeId = $state('');
	let tocOpen = $state(false);

	onMount(() => {
		tocOpen = window.matchMedia('(min-width: 1024px)').matches;
	});

	// Highlight the section currently in view.
	$effect(() => {
		const headings = document.querySelectorAll<HTMLElement>('.chronicle h2[id], .chronicle h3[id]');
		if (headings.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((entry) => entry.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]?.target.id) activeId = visible[0].target.id;
			},
			{ rootMargin: '-96px 0px -70% 0px', threshold: [0, 1] }
		);

		headings.forEach((heading) => observer.observe(heading));
		return () => observer.disconnect();
	});
</script>

<svelte:head>
	<title>{data.entry.metadata.title} — Азария Вики</title>
	<meta
		name="description"
		content={data.entry.metadata.description ??
			`${data.entry.metadata.title} — запись в гроссбухе мира Азарии.`}
	/>
</svelte:head>

<div class="seal" data-seal={category}>
	<!-- Breadcrumbs -->
	<nav class="eyebrow flex flex-wrap items-center gap-2" aria-label="Навигационная цепочка">
		<a href={resolve('/')} class="hover:text-brass-bright">Главная</a>
		<span aria-hidden="true">/</span>
		<a href={resolve(`/${category}` as `/${string}`)} class="hover:text-brass-bright"
			>{getCategoryName(category)}</a
		>
		<span aria-hidden="true">/</span>
		<span class="text-brass-deep">{data.entry.metadata.title}</span>
	</nav>

	<!-- Title block -->
	<header class="mt-6 border-b border-line pb-7">
		<div class="flex flex-wrap items-center gap-3">
			<span class="chip chip--brass">
				<Icon icon={getCategoryIcon(category)} width="12" class="seal-text" />
				{getCategoryName(category)}
			</span>
			<span class="folio">запись {folio}</span>
			{#if isShortStatus}
				<Stamp label={status} />
			{/if}
		</div>

		<h1 class="mt-4 font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
			{data.entry.metadata.title}
		</h1>

		<div class="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
			{#if data.entry.metadata.tags?.length}
				<div class="flex flex-wrap gap-1.5">
					{#each data.entry.metadata.tags as tag (tag)}
						<Tag label={tag} />
					{/each}
				</div>
			{/if}
			{#if updated}
				<span class="folio">обновлено {updated}</span>
			{/if}
			{#if data.citations > 0}
				<span class="folio">ссылаются {data.citations} раз</span>
			{/if}
		</div>
	</header>

	<div class="mt-8 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
		<!-- Table of contents -->
		{#if data.entry.toc.length > 2}
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<details class="group" bind:open={tocOpen}>
					<summary
						class="eyebrow flex cursor-pointer list-none items-center justify-between border-b border-line pb-2"
					>
						Содержание
						<Icon
							icon="mdi:chevron-down"
							width="14"
							class="transition-transform group-open:rotate-180"
						/>
					</summary>
					<nav class="mt-3 flex flex-col" aria-label="Содержание записи">
						{#each data.entry.toc as item, position (item.id)}
							<a
								href="#{item.id}"
								class="toc__link"
								class:toc__link--active={activeId === item.id}
								class:toc__link--sub={item.level === 3}
							>
								<span class="toc__num">{String(position + 1).padStart(2, '0')}</span>
								<span>{item.text}</span>
							</a>
						{/each}
					</nav>
				</details>
			</aside>
		{:else}
			<aside class="hidden lg:block"></aside>
		{/if}

		<div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_19rem]">
			<!-- Article -->
			<article class="chronicle order-2 xl:order-1">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html data.entry.content}
				<!-- eslint-enable svelte/no-at-html-tags -->

				<!-- Prev / next in this section -->
				<nav
					class="mt-12 grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
					aria-label="Соседние записи"
				>
					{#if previous}
						<a
							href={resolve(`/${category}/${previous.slug}` as `/${string}/${string}`)}
							class="group"
						>
							<span class="eyebrow flex items-center gap-1.5">
								<Icon icon="mdi:arrow-left" width="12" />
								Предыдущая
							</span>
							<span class="mt-1 block font-display text-lg group-hover:text-brass-bright"
								>{previous.title}</span
							>
						</a>
					{:else}
						<span></span>
					{/if}
					{#if next}
						<a
							href={resolve(`/${category}/${next.slug}` as `/${string}/${string}`)}
							class="group sm:text-right"
						>
							<span class="eyebrow flex items-center gap-1.5 sm:justify-end">
								Следующая
								<Icon icon={getUIIcon('arrow-right')} width="12" />
							</span>
							<span class="mt-1 block font-display text-lg group-hover:text-brass-bright"
								>{next.title}</span
							>
						</a>
					{/if}
				</nav>
			</article>

			<!-- Dossier -->
			<div class="order-1 xl:order-2">
				<Dossier entry={data.entry.metadata} backlinks={data.backlinks} />
			</div>
		</div>
	</div>

	<!-- Return -->
	<div class="mt-10 flex flex-wrap gap-3">
		<a href={resolve(`/${category}` as `/${string}`)} class="btn btn--sm">
			<Icon icon="mdi:arrow-left" width="13" />
			{getCategorySectionLabel(category)}
		</a>
		<button
			type="button"
			class="btn btn--quiet btn--sm"
			onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		>
			<Icon icon={getUIIcon('arrow-up')} width="13" />
			Наверх
		</button>
	</div>

	{#if data.backlinks.length > 0}
		<section class="mt-14">
			<SectionHeading eyebrow="Обратные ссылки" title="Связанные записи" />
			<div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.backlinks.slice(0, 6) as backlink (backlink.slug)}
					<LoreCard entry={backlink} showCategory />
				{/each}
			</div>
		</section>
	{/if}
</div>
