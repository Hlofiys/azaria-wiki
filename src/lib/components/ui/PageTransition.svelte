<!-- Page Transition Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	let isLoading = true;
	let showContent = false;

	let currentPath = '';

	onMount(() => {
		// Show loading state briefly for smooth transition
		setTimeout(() => {
			isLoading = false;
			setTimeout(() => {
				showContent = true;
			}, 50);
		}, 200);

		// Set initial path
		currentPath = $page.url.pathname;
	});

	// Handle route changes without reactive loop
	$: handleRouteChange($page.url.pathname);

	function handleRouteChange(newPath: string) {
		if (typeof window !== 'undefined' && newPath !== currentPath && currentPath !== '') {
			// Define routes that should NOT show loading screen
			const noLoadingRoutes = [
				// Category pages
				'/characters',
				'/locations',
				'/factions',
				'/artifacts',
				'/concepts',
				'/creatures',
				// Search page
				'/search'
			];

			// Check if current or new path is a no-loading route
			const currentIsNoLoading = noLoadingRoutes.some((route) => currentPath.startsWith(route));
			const newIsNoLoading = noLoadingRoutes.some((route) => newPath.startsWith(route));

			// Only show loading for major navigation (home to category, or completely different sections)
			const shouldShowLoading =
				!currentIsNoLoading &&
				!newIsNoLoading &&
				!newPath.startsWith('/admin') &&
				!currentPath.startsWith('/admin');

			if (shouldShowLoading) {
				isLoading = true;
				showContent = false;
				setTimeout(() => {
					isLoading = false;
					setTimeout(() => {
						showContent = true;
					}, 50);
				}, 50);
			}
		}
		currentPath = newPath;
	}
</script>

<!-- Page Loading Overlay -->
{#if isLoading}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300"
		style="
			background: #1a1a1a;
			backdrop-filter: blur(4px);
		"
	>
		<div class="text-center">
			<!-- Azaria Logo/Symbol -->
			<div
				class="border-azaria-gold/30 mx-auto mb-4 flex h-16 w-16 animate-spin items-center justify-center rounded-full border-2"
				style="
					background: radial-gradient(circle, rgba(201, 168, 118, 0.1) 0%, transparent 70%);
					animation: spin 1s linear infinite, glow 2s ease-in-out infinite alternate;
				"
			>
				<svg class="h-8 w-8" style="color: #c9a876;" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>

			<!-- Loading Text -->
			<p
				class="animate-pulse text-sm font-medium tracking-wide"
				style="color: #c9a876; font-family: 'Cinzel Decorative', serif;"
			>
				Загрузка Азарии...
			</p>
		</div>
	</div>
{/if}

<!-- Page Content with Transition -->
<div
	class="page-content transition-all duration-500 ease-out"
	class:opacity-0={!showContent}
	class:opacity-100={showContent}
	class:translate-y-4={!showContent}
	class:translate-y-0={showContent}
>
	<slot />
</div>

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes glow {
		from {
			box-shadow: 0 0 5px rgba(201, 168, 118, 0.3);
		}
		to {
			box-shadow: 0 0 20px rgba(201, 168, 118, 0.6);
		}
	}

	.page-content {
		transform-origin: center top;
	}
</style>
