<!-- PWA Manager Component - Handles PWA lifecycle -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';

	let swRegistration: ServiceWorkerRegistration | null = null;
	let updateAvailable = false;
	let showUpdatePrompt = false;

	onMount(() => {
		if (!browser || dev) return;

		// Register service worker
		registerServiceWorker();

		// Handle visibility change for cache updates
		document.addEventListener('visibilitychange', handleVisibilityChange);

		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	async function registerServiceWorker() {
		if (!('serviceWorker' in navigator)) {
			console.warn('PWA: Service Worker not supported');
			return;
		}

		try {
			// Register the service worker with correct path
			swRegistration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
				updateViaCache: 'none'
			});

			console.log('PWA: Service Worker registered successfully');

			// Listen for updates
			swRegistration.addEventListener('updatefound', handleUpdateFound);

			// Check for immediate updates
			if (swRegistration.waiting) {
				updateAvailable = true;
				showUpdatePrompt = true;
			}

			// Listen for messages from SW
			navigator.serviceWorker.addEventListener('message', handleSWMessage);

			// Check for updates periodically
			setInterval(checkForUpdates, 60000); // Check every minute
		} catch (error) {
			console.error('PWA: Service Worker registration failed:', error);
			// Don't throw error, just log it - PWA should work without SW
			return;
		}
	}

	function handleUpdateFound() {
		if (!swRegistration) return;

		const newWorker = swRegistration.installing;
		if (!newWorker) return;

		newWorker.addEventListener('statechange', () => {
			if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
				// New content is available
				updateAvailable = true;
				showUpdatePrompt = true;
			}
		});
	}

	function handleSWMessage(event: MessageEvent) {
		const { data } = event;

		if (data?.type === 'UPDATE_AVAILABLE') {
			updateAvailable = true;
			showUpdatePrompt = true;
		}

		if (data?.type === 'CACHE_UPDATED') {
			console.log('PWA: Cache updated successfully');
		}
	}

	async function checkForUpdates() {
		if (!swRegistration) return;

		try {
			await swRegistration.update();
		} catch (error) {
			console.warn('PWA: Update check failed (this is normal):', error);
		}
	}

	function handleVisibilityChange() {
		if (document.visibilityState === 'visible') {
			// App became visible, check for updates
			checkForUpdates();
		}
	}

	async function applyUpdate() {
		if (!swRegistration?.waiting) return;

		// Tell the waiting service worker to skip waiting
		swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

		// Reload the page to apply the update
		window.location.reload();
	}

	function dismissUpdate() {
		showUpdatePrompt = false;
		// Show again in 1 hour
		setTimeout(
			() => {
				if (updateAvailable) {
					showUpdatePrompt = true;
				}
			},
			60 * 60 * 1000
		);
	}

	// Preload critical pages for offline use
	function preloadCriticalPages() {
		if (!('serviceWorker' in navigator)) return;

		const criticalPages = ['/', '/characters', '/locations', '/factions', '/search'];

		navigator.serviceWorker.ready.then((registration) => {
			registration.active?.postMessage({
				type: 'CACHE_PAGES',
				pages: criticalPages
			});
		});
	}

	// Preload on mount
	onMount(() => {
		if (browser && !dev) {
			setTimeout(preloadCriticalPages, 5000); // Preload after 5 seconds
		}
	});
</script>

<!-- Update Prompt - Only show on mobile devices -->
{#if showUpdatePrompt && updateAvailable}
	{@const isMobile =
		typeof window !== 'undefined' &&
		/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}
	{#if isMobile}
		<div
			class="fixed top-4 right-4 z-50 max-w-sm transform transition-all duration-300 ease-in-out"
			role="alert"
			aria-live="polite"
		>
			<div
				class="azaria-card rounded-lg border-2 p-4 shadow-lg"
				style="
				background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
				border-color: #c9a876;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(201, 168, 118, 0.3);
			"
			>
				<!-- Content -->
				<div class="flex items-start gap-3">
					<!-- Icon -->
					<div
						class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
						style="background: rgba(88, 214, 141, 0.1); border: 1px solid rgba(88, 214, 141, 0.3);"
					>
						<svg class="h-5 w-5" style="color: #58D68D;" fill="currentColor" viewBox="0 0 20 20">
							<path
								fill-rule="evenodd"
								d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>

					<!-- Text content -->
					<div class="flex-1">
						<h3 class="font-heading mb-1 text-sm font-semibold" style="color: #c9a876;">
							Обновление доступно
						</h3>
						<p class="mb-3 text-xs" style="color: rgba(243, 233, 210, 0.8);">
							Новая версия Азария Вики готова к установке
						</p>

						<!-- Action buttons -->
						<div class="flex gap-2">
							<button
								class="azaria-btn text-xs"
								on:click={applyUpdate}
								style="padding: 0.375rem 0.75rem;"
							>
								Обновить
							</button>
							<button
								class="border-azaria-text/30 text-azaria-text/80 hover:bg-azaria-text/10 rounded border bg-transparent px-2 py-1 text-xs transition-colors"
								on:click={dismissUpdate}
							>
								Позже
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}

<style>
	.azaria-card {
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
	}
</style>
