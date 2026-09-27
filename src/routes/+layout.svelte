<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import PWAManager from '$lib/components/pwa/PWAManager.svelte';
	import ScrollToTop from '$lib/components/ui/ScrollToTop.svelte';
	import ImageViewer from '$lib/components/ui/ImageViewer.svelte';
	import { initializeClientData } from '$lib/client-data.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { resolve } from '$app/paths';
	import { isFullscreen } from '$lib/stores';
	import { Icon, getUIIcon } from '$lib/icons';
	import { CATEGORY_ORDER, categoryNames } from '$lib/utils/categories';

	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
	let visible = $state(false);
	let isFullscreenActive = $state(false);
	let year = $state(new Date().getFullYear());

	onMount(() => {
		if (data?.allEntries) {
			initializeClientData(data.allEntries);
		}

		const unsubscribe = isFullscreen.subscribe((value) => {
			isFullscreenActive = value;
		});

		return () => {
			unsubscribe();
		};
	});

	const imageUrl = $derived($page.data.entry?.metadata?.image);

	$effect(() => {
		if (imageUrl && !isFullscreenActive) {
			const img = new Image();
			img.src = imageUrl;
			img.onload = () => {
				visible = true;
			};
		} else {
			visible = false;
		}
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
</svelte:head>

<a
	href="#content"
	class="btn btn--solid sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50"
>
	К содержанию
</a>

<div
	class="background-image"
	class:visible
	style:background-image={imageUrl ? `url(${imageUrl})` : 'none'}
></div>

<Header />

<main id="content" class="mx-auto max-w-7xl px-4 py-8 sm:py-10">
	{@render children()}
</main>

<PWAManager />
<InstallPrompt />
<ScrollToTop />
<ImageViewer />

<footer class="mt-16 border-t border-line bg-ink-850/60">
	<div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
		<div class="sm:col-span-2">
			<p class="eyebrow">Гроссбух Азарии</p>
			<p class="mt-3 max-w-md font-display text-xl leading-snug text-parchment">
				Вики мира, где средневековье встречается с философией азарта.
			</p>
			<p class="mt-3 text-sm text-parchment-mute">Создано с помощью SvelteKit и магии удачи.</p>
		</div>

		<nav aria-label="Разделы">
			<p class="eyebrow mb-3">Разделы</p>
			<ul class="flex flex-col gap-1.5">
				{#each CATEGORY_ORDER as category (category)}
					<li>
						<a
							href={resolve(`/${category}` as `/${string}`)}
							data-seal={category}
							class="seal flex items-center gap-2 text-sm text-parchment-dim hover:text-brass-bright"
						>
							<Icon icon={getUIIcon('arrow-right')} width="12" class="seal-text" />
							{categoryNames[category].plural}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div>
			<p class="eyebrow mb-3">Служебное</p>
			<ul class="flex flex-col gap-1.5 text-sm text-parchment-dim">
				<li>
					<a href={resolve('/search')} class="hover:text-brass-bright">Все записи</a>
				</li>
				<li>
					<a href={resolve('/admin')} class="hover:text-brass-bright">Служебный вход</a>
				</li>
			</ul>
			<p class="folio mt-4">лист {year} · все права у удачи</p>
		</div>
	</div>
</footer>

<style>
	.background-image {
		position: fixed;
		inset: 0;
		background-size: cover;
		background-position: center;
		z-index: -1;
		opacity: 0;
		transition: opacity 0.6s ease-in-out;
		mask-image: linear-gradient(to bottom, #000, transparent 70%);
		-webkit-mask-image: linear-gradient(to bottom, #000, transparent 70%);
	}

	.background-image.visible {
		opacity: 0.07;
	}
</style>
