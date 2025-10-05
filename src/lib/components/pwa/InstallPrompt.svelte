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
		// Don't show again for this session
		sessionStorage.setItem('pwa-install-dismissed', 'true');
	}

	// Check if user already dismissed this session on mount
	onMount(() => {
		if (browser && sessionStorage.getItem('pwa-install-dismissed')) {
			showInstallPrompt = false;
		}
	});
</script>

<!-- Install Prompt - Only show on mobile or when user explicitly triggers it -->
{#if showInstallPrompt && !isInstalled && (deferredPrompt || isIOS)}
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
							Добавьте в закладки Safari и выберите "На экран «Домой»" для быстрого доступа
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

<!-- iOS Install Instructions -->
{#if isIOS && showInstallPrompt && !isInstalled}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
		role="dialog"
		aria-modal="true"
	>
		<div
			class="azaria-card max-w-md rounded-lg p-6"
			style="background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);"
		>
			<div class="mb-4 text-center">
				<Icon icon="mdi:apple" class="mx-auto mb-2 h-12 w-12" style="color: #c9a876;" />
				<h3 class="font-heading text-xl font-semibold" style="color: #c9a876;">Установка на iOS</h3>
			</div>

			<div class="space-y-3 text-sm" style="color: rgba(243, 233, 210, 0.8);">
				<div class="flex items-center gap-3">
					<div
						class="bg-azaria-gold/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
						style="color: #c9a876;"
					>
						1
					</div>
					<span>Нажмите кнопку "Поделиться" в Safari</span>
				</div>
				<div class="flex items-center gap-3">
					<div
						class="bg-azaria-gold/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
						style="color: #c9a876;"
					>
						2
					</div>
					<span>Выберите "На экран «Домой»"</span>
				</div>
				<div class="flex items-center gap-3">
					<div
						class="bg-azaria-gold/20 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
						style="color: #c9a876;"
					>
						3
					</div>
					<span>Нажмите "Добавить"</span>
				</div>
			</div>

			<button class="azaria-btn mt-6 w-full" on:click={dismissPrompt}> Понятно </button>
		</div>
	</div>
{/if}

<style>
	.azaria-card {
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
	}
</style>
