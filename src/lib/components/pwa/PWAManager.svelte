<!-- PWA Manager Component - Handles PWA lifecycle -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';
	import { Icon } from '$lib/icons';

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
			<div class="frame">
				<div class="relative z-10 p-4">
					<!-- Content -->
					<div class="flex items-start gap-3">
						<!-- Icon -->
						<div
							class="grid size-10 shrink-0 place-items-center border border-line-strong bg-ink-700/50"
						>
							<Icon icon="mdi:refresh" width="18" class="text-ok" />
						</div>

						<!-- Text content -->
						<div class="flex-1">
							<h3 class="mb-1 font-display text-sm text-parchment">Обновление доступно</h3>
							<p class="mb-3 text-xs text-parchment-dim">
								Новая версия Азария Вики готова к установке
							</p>

							<!-- Action buttons -->
							<div class="flex gap-2">
								<button class="btn btn--sm" on:click={applyUpdate}>Обновить</button>
								<button class="btn btn--quiet btn--sm" on:click={dismissUpdate}>Позже</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	{/if}
{/if}
