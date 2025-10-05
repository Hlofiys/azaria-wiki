<!-- Manual Install Button for Testing/Desktop -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Icon } from '$lib/icons';

	let deferredPrompt: BeforeInstallPromptEvent | null = null;
	let showButton = false;
	let isInstalled = false;

	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	onMount(() => {
		if (!browser) return;

		// Check if already installed
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		isInstalled =
			isStandalone || Boolean((window.navigator as { standalone?: boolean }).standalone);

		// Listen for install prompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
			showButton = true;
		};

		// Listen for app installed
		const handleAppInstalled = () => {
			showButton = false;
			isInstalled = true;
			deferredPrompt = null;
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
		};
	});

	async function handleInstall() {
		if (!deferredPrompt) return;

		try {
			const result = await deferredPrompt.prompt();
			console.log('PWA install prompt result:', result);

			if (result.outcome === 'accepted') {
				showButton = false;
			}
		} catch (error) {
			console.error('PWA install failed:', error);
		}

		deferredPrompt = null;
	}
</script>

<!-- Install Button (appears in header for testing) -->
{#if showButton && !isInstalled && deferredPrompt}
	<button
		on:click={handleInstall}
		class="azaria-btn flex items-center gap-1 text-xs"
		style="padding: 0.375rem 0.75rem;"
		title="Установить как приложение"
	>
		<Icon icon="mdi:download" class="h-4 w-4" />
		<span class="hidden sm:inline">Установить</span>
	</button>
{/if}
