<!-- PWA Manager Component - Handles PWA lifecycle -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { dev } from '$app/environment';

	// Updates apply silently: we never surface an "update available" banner.
	// On page load we check once for a new version; if one is already waiting it
	// takes over and the page reloads once — but only for returning visitors, so
	// a first visit is never reloaded. Mid-session worker updates simply wait for
	// the next launch, so reading is never interrupted.
	let refreshing = false;

	onMount(() => {
		if (!browser || dev) return;

		registerServiceWorker();
	});

	async function registerServiceWorker() {
		if (!('serviceWorker' in navigator)) {
			console.warn('PWA: Service Worker not supported');
			return;
		}

		try {
			const hadController = Boolean(navigator.serviceWorker.controller);

			const registration = await navigator.serviceWorker.register('/sw.js', {
				scope: '/',
				updateViaCache: 'none'
			});

			const activateWaiting = () => {
				registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
			};

			registration.addEventListener('updatefound', () => {
				const worker = registration.installing;
				worker?.addEventListener('statechange', () => {
					if (worker.state === 'installed' && navigator.serviceWorker.controller) {
						activateWaiting();
					}
				});
			});

			// One reload per new version: it swaps the running page onto the new
			// cached assets. Invisible except for the momentary refresh.
			navigator.serviceWorker.addEventListener('controllerchange', () => {
				if (!hadController || refreshing) return;
				refreshing = true;
				window.location.reload();
			});

			// Single check per page load — no polling, so no surprise banners.
			await registration.update().catch(() => {});

			// A version may already be waiting from a previous session.
			activateWaiting();
		} catch (error) {
			console.error('PWA: Service Worker registration failed:', error);
			// Don't throw error, just log it - PWA should work without SW
		}
	}
</script>
