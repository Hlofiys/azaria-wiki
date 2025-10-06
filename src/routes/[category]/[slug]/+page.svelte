<script lang="ts">
	import Infobox from '$lib/components/ui/Infobox.svelte';
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { Icon, getUIIcon } from '$lib/icons';
	import { resolve } from '$app/paths';
	import { getCategoryName } from '$lib/utils/categories';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.entry.metadata.title} — Азария Вики</title>
	<meta name="description" content="Информация о {data.entry.metadata.title} в мире Азарии" />
</svelte:head>

<div class="mx-auto max-w-7xl px-2 sm:px-4">
	<div class="grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-3 lg:gap-8">
		<!-- Main Content -->
		<div class="order-2 lg:col-span-2">
			<div class="azaria-card">
				<div class="p-4 md:p-6 lg:p-8">
					<!-- Breadcrumbs -->
					<div class="breadcrumbs">
						<nav class="breadcrumb-nav">
							<a href={resolve('/')} class="breadcrumb-link">Главная</a> /
							<a
								href={resolve(`/${data.entry.metadata.category}` as `/${string}`)}
								class="breadcrumb-link"
							>
								{getCategoryName(data.entry.metadata.category)}
							</a>
							/
							<span class="breadcrumb-current">{data.entry.metadata.title}</span>
						</nav>
					</div>

					<!-- Main Title -->
					<h1 class="main-title sm:text-xl md:mb-6 md:text-2xl lg:text-3xl">
						{data.entry.metadata.title}
					</h1>

					<!-- Content -->
					<!-- eslint-disable svelte/no-at-html-tags -->
					<div class="content-wrapper">
						<div class="markdown-content">
							{@html data.entry.content}
						</div>
					</div>
					<!-- eslint-enable svelte/no-at-html-tags -->

					<!-- Navigation -->
					<div
						class="border-azaria-gold/30 mt-6 flex flex-col items-start justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center md:mt-8 md:pt-6"
					>
						<a
							href={resolve(`/${data.entry.metadata.category}` as `/${string}`)}
							class="azaria-btn inline-block text-sm md:text-base"
						>
							← Назад к {getCategoryName(data.entry.metadata.category, 'plural')
								.toLowerCase()
								.replace(/и$/, 'ам')
								.replace(/а$/, 'е')}
						</a>

						<button
							on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
							class="azaria-btn inline-block text-sm md:text-base"
						>
							↑ Наверх
						</button>
					</div>
				</div>
			</div>
		</div>

		<!-- Sidebar with Infobox -->
		<div class="order-1 lg:order-2">
			<Infobox entry={data.entry.metadata} backlinks={data.backlinks} />
		</div>
	</div>

	<!-- Related Entries (if backlinks exist) -->
	{#if data.backlinks && data.backlinks.length > 0}
		<div class="mt-8 md:mt-12">
			<h2 class="font-heading text-azaria-gold mb-4 text-xl md:mb-6 md:text-2xl">
				<div class="flex flex-col items-center justify-center gap-2 sm:flex-row">
					<Icon icon={getUIIcon('book')} />
					<span>Связанные статьи</span>
				</div>
			</h2>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
				{#each data.backlinks.slice(0, 6) as backlink (backlink.slug)}
					<LoreCard entry={backlink} showCategory={true} />
				{/each}
			</div>

			{#if data.backlinks.length > 6}
				<div class="mt-4 text-center md:mt-6">
					<p class="text-azaria-text/70 font-body text-sm md:text-base">
						И еще {data.backlinks.length - 6} связанных статей...
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.markdown-content :global(h1),
	.markdown-content :global(h2),
	.markdown-content :global(h3),
	.markdown-content :global(h4) {
		font-family: 'Cinzel Decorative', serif;
		color: #c9a876;
		text-shadow: 0 0 8px rgba(212, 175, 55, 0.3);
		margin-bottom: 1rem;
		margin-top: 1.5rem;
	}
	.markdown-content :global(h1) {
		font-size: 1.875rem;
	}
	.markdown-content :global(h2) {
		font-size: 1.5rem;
	}
	.markdown-content :global(h3) {
		font-size: 1.25rem;
	}
	.markdown-content :global(h4) {
		font-size: 1.125rem;
	}

	.markdown-content :global(p) {
		margin-bottom: 1rem;
		color: #d0d0d0;
		font-family: 'Lora', serif;
		line-height: 1.7;
	}

	.markdown-content :global(ul),
	.markdown-content :global(ol) {
		list-style-position: inside;
		margin-bottom: 1rem;
		color: #d0d0d0;
		padding-left: 1rem;
	}
	.markdown-content :global(ul) {
		list-style-type: disc;
	}
	.markdown-content :global(ol) {
		list-style-type: decimal;
	}

	.markdown-content :global(li) {
		margin-bottom: 0.25rem;
	}

	.markdown-content :global(strong) {
		color: #c9a876;
		font-weight: 600;
	}

	.markdown-content :global(em) {
		color: #f4d03f;
		font-style: italic;
	}

	.markdown-content :global(blockquote) {
		border-left: 4px solid #c9a876;
		padding-left: 1rem;
		margin: 1rem 0;
		font-style: italic;
		color: #f4d03f;
	}

	/* Your existing wiki-link styles are already good */
	:global(.wiki-link) {
		color: #c9a876;
		text-decoration: underline;
		transition: color 0.3s ease;
		position: relative;
	}
	:global(.wiki-link:hover::after) {
		content: attr(title);
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(42, 13, 46, 0.95);
		color: #f3e9d2;
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid #ffd700;
		font-size: 0.75rem;
		white-space: nowrap;
		z-index: 10;
		pointer-events: none;
	}
	:global(.wiki-link-missing) {
		color: #8b2635;
		cursor: help;
		border-bottom: 1px dotted #8b2635;
	}
	:global(.wiki-link-missing:hover::after) {
		content: attr(title);
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(200, 30, 30, 0.95);
		color: #f3e9d2;
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid #c81e1e;
		font-size: 0.75rem;
		white-space: nowrap;
		z-index: 10;
		pointer-events: none;
	}

	.breadcrumbs {
		font-size: 0.75rem;
		margin-bottom: 0.75rem;
	}

	.breadcrumb-nav {
		color: rgba(226, 213, 199, 0.7);
	}

	.breadcrumb-link {
		color: #c9a876;
		text-decoration: none;
	}

	.breadcrumb-current {
		color: #c9a876;
	}

	.main-title {
		font-size: 1.5rem;
		font-family: 'Cinzel Decorative', serif;
		color: #c9a876;
		margin-bottom: 1rem;
		text-shadow: 0 0 12px rgba(212, 175, 55, 0.4);
	}

	.content-wrapper {
		max-width: none;
	}
</style>
