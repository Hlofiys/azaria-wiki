<!-- iOS Install Button for Header -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { Icon } from '$lib/icons';

	let showButton = false;
	let isIOS = false;
	let isInstalled = false;

	onMount(() => {
		if (!browser) return;

		// Detect iOS
		isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

		// Check if already installed
		const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
		isInstalled =
			isStandalone || Boolean((window.navigator as { standalone?: boolean }).standalone);

		// Show button on iOS if not installed
		showButton = isIOS && !isInstalled;
	});

	function showInstructions() {
		// Dispatch custom event to show iOS instructions
		window.dispatchEvent(new CustomEvent('show-ios-install'));
	}
</script>

<!-- iOS Install Button -->
{#if showButton}
	<button
		on:click={showInstructions}
		class="azaria-btn flex items-center gap-1 text-xs"
		style="padding: 0.375rem 0.75rem;"
		title="Установить на iOS"
	>
		<Icon icon="mdi:apple" class="h-4 w-4" />
		<span class="hidden sm:inline">Установить</span>
	</button>
{/if}
