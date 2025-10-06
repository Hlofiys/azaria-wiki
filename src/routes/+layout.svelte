<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import PWAManager from '$lib/components/pwa/PWAManager.svelte';
	import PageTransition from '$lib/components/ui/PageTransition.svelte';
	import ScrollToTop from '$lib/components/ui/ScrollToTop.svelte';
	import { initializeClientData } from '$lib/client-data.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { isFullscreen } from '$lib/stores';
	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
	let mainContent: HTMLElement;
	let visible = $state(false);
	let showHeader = $state(true);

	onMount(() => {
		if (data?.allEntries) {
			initializeClientData(data.allEntries);
		}

		const unsubscribe = isFullscreen.subscribe((value) => {
			showHeader = !value;
		});

		return () => {
			unsubscribe();
		};
	});

	const imageUrl = $derived($page.data.entry?.metadata?.image);

	$effect(() => {
		if (imageUrl) {
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

<div class="background-container">
	<div
		class="background-image"
		class:visible
		style:background-image={imageUrl ? `url(${imageUrl})` : 'none'}
	/>
	{#if showHeader}
		<Header />
	{/if}

	<PageTransition>
		<main bind:this={mainContent} class="container mx-auto px-4 py-8">
			{@render children()}
		</main>
	</PageTransition>

	<PWAManager />
	<InstallPrompt />
	<ScrollToTop />

	<footer class="azaria-card border-t-2" style="border-top-color: #c9a876; margin-top: 4rem;">
		<div class="container mx-auto px-4 py-8 text-center">
			<p style="color: rgba(208, 208, 208, 0.7); font-family: 'Lora', serif;">
				Вики мира Азарии — Медивал-деп-панк вселенная
			</p>
			<p
				style="color: rgba(208, 208, 208, 0.5); font-family: 'Lora', serif; font-size: 0.875rem; margin-top: 0.5rem;"
			>
				Создано с помощью SvelteKit и магии удачи
			</p>
		</div>
	</footer>
</div>

<style>
	.background-container {
		min-height: 100vh;
		background-color: #1a1a1a;
		position: relative;
	}

	.background-image {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-size: cover;
		background-position: center;
		z-index: -1;
		opacity: 0;
		transition: opacity 0.5s ease-in-out;
	}

	.background-image.visible {
		opacity: 0.1;
	}
</style>
