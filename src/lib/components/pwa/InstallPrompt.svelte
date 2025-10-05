<!-- PWA Install Prompt Component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Icon, getUIIcon } from '$lib/icons';

	let showInstallPrompt = false;
	let deferredPrompt: BeforeInstallPromptEvent | null = null;
	let isInstalled = false;
	let isIOS = false;
	let isStandalone = false;

	interface BeforeInstallPromptEvent extends Event {
		prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
	}

	onMount(() => {
		if (!browser) return;

		// Check if app is already installed
		isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		isInstalled =
			isStandalone || Boolean((window.navigator as { standalone?: boolean }).standalone);

		// Detect iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		// For iOS, show install prompt with smart timing
		if (isIOS && !isInstalled) {
			const lastDismissed = localStorage.getItem('ios-pwa-dismissed');
			const now = Date.now();

			if (!lastDismissed) {
				// First visit - show after 5 seconds
				setTimeout(() => {
					showInstallPrompt = true;
				}, 5000);
			} else {
				// Previously dismissed - show again after 24 hours
				const dismissedTime = parseInt(lastDismissed);
				const hoursPassed = (now - dismissedTime) / (1000 * 60 * 60);

				if (hoursPassed >= 24) {
					setTimeout(() => {
						showInstallPrompt = true;
					}, 30000); // Show after 30 seconds on return visit
				}
			}
		}

		// Listen for install prompt
		const handleBeforeInstallPrompt = (e: Event) => {
			e.preventDefault();
			deferredPrompt = e as BeforeInstallPromptEvent;
			showInstallPrompt = true;
		};

		// Listen for app installed
		const handleAppInstalled = () => {
			showInstallPrompt = false;
			isInstalled = true;
			deferredPrompt = null;
		};

		// Service worker messages
		const handleSWMessage = (event: MessageEvent) => {
			if (event.data?.type === 'INSTALL_PROMPT_AVAILABLE') {
				showInstallPrompt = true;
			}
			if (event.data?.type === 'APP_INSTALLED') {
				handleAppInstalled();
			}
		};

		window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
		window.addEventListener('appinstalled', handleAppInstalled);
		navigator.serviceWorker?.addEventListener('message', handleSWMessage);

		// No manual trigger needed - iOS prompts are automatic only

		// Auto-show prompt after some time if not installed (mobile only)
		const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
			navigator.userAgent
		);
		if (!isInstalled && !isIOS && isMobile) {
			setTimeout(() => {
				if (!isInstalled && !showInstallPrompt) {
					showInstallPrompt = true;
				}
			}, 30000); // Show after 30 seconds on mobile only
		}

		return () => {
			window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
			window.removeEventListener('appinstalled', handleAppInstalled);
			navigator.serviceWorker?.removeEventListener('message', handleSWMessage);
		};
	});

	async function handleInstall() {
		if (!deferredPrompt) return;

		try {
			const result = await deferredPrompt.prompt();
			console.log('PWA install prompt result:', result);

			if (result.outcome === 'accepted') {
				showInstallPrompt = false;
			}
		} catch (error) {
			console.error('PWA install failed:', error);
		}

		deferredPrompt = null;
	}

	function dismissPrompt() {
		showInstallPrompt = false;

		if (isIOS) {
			// For iOS, remember dismissal for 24 hours
			localStorage.setItem('ios-pwa-dismissed', Date.now().toString());
		} else {
			// For other platforms, session-only dismissal
			sessionStorage.setItem('pwa-install-dismissed', 'true');
		}
	}

	// Check if user already dismissed this session on mount
	onMount(() => {
		if (browser && sessionStorage.getItem('pwa-install-dismissed')) {
			showInstallPrompt = false;
		}
	});
</script>

<!-- Install Prompt - Show on mobile or iOS -->
{#if showInstallPrompt && !isInstalled}
	<div
		class="fixed right-4 bottom-4 left-4 z-50 mx-auto max-w-md transform transition-all duration-300 ease-in-out"
		role="dialog"
		aria-labelledby="install-prompt-title"
		aria-describedby="install-prompt-description"
	>
		<div
			class="azaria-card rounded-lg border-2 p-4 shadow-lg"
			style="
				background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
				border-color: #c9a876;
				box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 16px rgba(201, 168, 118, 0.3);
			"
		>
			<!-- Close button -->
			<button
				class="text-azaria-text/60 hover:text-azaria-text absolute top-2 right-2"
				on:click={dismissPrompt}
				aria-label="Закрыть"
			>
				<Icon icon="mdi:close" class="h-5 w-5" />
			</button>

			<!-- Content -->
			<div class="flex items-start gap-3">
				<!-- Icon -->
				<div
					class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg"
					style="background: rgba(201, 168, 118, 0.1); border: 1px solid rgba(201, 168, 118, 0.3);"
				>
					<Icon icon={getUIIcon('home')} class="h-6 w-6" style="color: #c9a876;" />
				</div>

				<!-- Text content -->
				<div class="flex-1">
					<h3
						id="install-prompt-title"
						class="font-heading mb-1 text-lg font-semibold"
						style="color: #c9a876;"
					>
						Установить Азария Вики
					</h3>
					<p
						id="install-prompt-description"
						class="mb-3 text-sm"
						style="color: rgba(243, 233, 210, 0.8);"
					>
						{#if isIOS}
							Нажмите <Icon icon="mdi:export-variant" class="mx-1 inline h-4 w-4" /> в Safari, затем
							"На экран «Домой»"
						{:else}
							Установите приложение для быстрого доступа и работы в автономном режиме
						{/if}
					</p>

					<!-- Action buttons -->
					<div class="flex gap-2">
						{#if !isIOS}
							<button
								class="azaria-btn flex-1 text-sm"
								on:click={handleInstall}
								style="padding: 0.5rem 1rem;"
							>
								<Icon icon="mdi:download" class="mr-1 inline h-4 w-4" />
								Установить
							</button>
						{/if}
						<button
							class="border-azaria-text/30 text-azaria-text/80 hover:bg-azaria-text/10 flex-1 rounded border bg-transparent px-3 py-2 text-sm transition-colors"
							on:click={dismissPrompt}
						>
							Позже
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- iOS Install Instructions - Only small notification, no full screen modal -->

<!-- Full screen iOS modal removed -->

<style>
	.azaria-card {
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
	}
</style>
