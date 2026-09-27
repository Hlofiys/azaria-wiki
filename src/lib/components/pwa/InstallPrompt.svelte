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
		<div class="frame">
			<div class="relative z-10 p-4">
				<!-- Close button -->
				<button
					class="icon-btn absolute top-2 right-2"
					on:click={dismissPrompt}
					aria-label="Закрыть"
				>
					<Icon icon="mdi:close" class="h-5 w-5" />
				</button>

				<!-- Content -->
				<div class="flex items-start gap-3">
					<!-- Icon -->
					<div
						class="grid size-12 shrink-0 place-items-center border border-line-strong bg-ink-700/50"
					>
						<Icon icon={getUIIcon('home')} class="h-6 w-6 text-brass" />
					</div>

					<!-- Text content -->
					<div class="flex-1">
						<h3 id="install-prompt-title" class="mb-1 font-display text-lg text-parchment">
							Установить Азария Вики
						</h3>
						<p id="install-prompt-description" class="mb-3 text-sm text-parchment-dim">
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
								<button class="btn flex-1" on:click={handleInstall}>
									<Icon icon="mdi:download" class="mr-1 inline h-4 w-4" />
									Установить
								</button>
							{/if}
							<button class="btn btn--quiet flex-1" on:click={dismissPrompt}> Позже </button>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}

<!-- iOS Install Instructions - Only small notification, no full screen modal -->

<!-- Full screen iOS modal removed -->
