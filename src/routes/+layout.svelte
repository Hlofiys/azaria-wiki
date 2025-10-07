<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';
	import InstallPrompt from '$lib/components/pwa/InstallPrompt.svelte';
	import PWAManager from '$lib/components/pwa/PWAManager.svelte';
	import PageTransition from '$lib/components/ui/PageTransition.svelte';
	import ScrollToTop from '$lib/components/ui/ScrollToTop.svelte';
	import LazyImageViewer from '$lib/components/lazy/LazyImageViewer.svelte';
	import { initializeClientData } from '$lib/client-data.js';
	import { RoutePreloader } from '$lib/utils/route-preloader.js';
	import { BuildOptimizer } from '$lib/utils/build-optimizer.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { isFullscreen } from '$lib/stores';

	import type { Snippet } from 'svelte';
	import type { LayoutServerData } from './$types';

	let { children, data }: { children: Snippet; data: LayoutServerData } = $props();
	let mainContent: HTMLElement;
	let visible = $state(false);
	let isFullscreenActive = $state(false);

	onMount(() => {
		if (data?.allEntries) {
			initializeClientData(data.allEntries);

			// Initialize all performance optimizations
			const buildOptimizer = BuildOptimizer.getInstance();
			const routePreloader = RoutePreloader.getInstance();

			// Auto-initialize all optimizations
			buildOptimizer.initializeOptimizations().catch(() => {});

			// Preload likely components based on current route
			const currentRoute = $page.route?.id || '';
			if (currentRoute === '/') {
				routePreloader.preloadComponents(['LazyLoreCard']).catch(() => {});
			}

			// Listen for service worker updates
			window.addEventListener('sw-update-available', () => {
				console.log('App update available - refresh to get latest version');
			});
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

<div class="background-container">
	<div
		class="background-image"
		class:visible
		style:background-image={imageUrl ? `url(${imageUrl})` : 'none'}
	></div>
	<Header />

	<PageTransition>
		<main bind:this={mainContent} class="container mx-auto px-4 py-8">
			{#await data.allEntries}
				<div class="loading-container">
					<p>Загрузка Азарии...</p>
				</div>
			{:then}
				{@render children()}
			{/await}
		</main>
	</PageTransition>

	<PWAManager />
	<InstallPrompt />
	<ScrollToTop />

	<LazyImageViewer />

	<footer class="main-footer">
		<div class="container mx-auto px-4 py-8 text-center">
			<p class="footer-title">Вики мира Азарии — Медивал-деп-панк вселенная</p>
			<p class="footer-subtitle">Создано с помощью SvelteKit и магии удачи</p>
		</div>
	</footer>
</div>

<style>
	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		font-size: 2rem;
		color: #c9a876;
	}
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

	.main-footer {
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border-top: 2px solid #c9a876;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
		border-radius: 0.5rem;
		margin-top: 4rem;
	}
	.footer-title {
		color: rgba(208, 208, 208, 0.7);
		font-family: 'Lora', serif;
	}
	.footer-subtitle {
		color: rgba(208, 208, 208, 0.5);
		font-family: 'Lora', serif;
		font-size: 0.875rem;
		margin-top: 0.5rem;
	}
</style>
