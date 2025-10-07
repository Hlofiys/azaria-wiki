<!-- Lazy-loaded ImageViewer component -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { imageViewer } from '$lib/stores/imageViewerStore';

	let isLoaded = $state(false);
	let ImageViewerComponent = $state<any>(null);

	// Only load the ImageViewer when it's actually needed
	$effect(() => {
		if ($imageViewer.isOpen && !isLoaded && !ImageViewerComponent) {
			loadImageViewer();
		}
	});

	async function loadImageViewer() {
		try {
			const module = await import('../ui/ImageViewer.svelte');
			ImageViewerComponent = module.default;
			isLoaded = true;
		} catch (error) {
			console.error('Failed to load ImageViewer component:', error);
		}
	}
</script>

{#if $imageViewer.isOpen}
	{#if isLoaded && ImageViewerComponent}
		{@render ImageViewerComponent?.()}
	{:else}
		<!-- Loading overlay -->
		<div 
			class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
			onclick={() => imageViewer.close()}
			onkeydown={(e) => e.key === 'Escape' && imageViewer.close()}
			role="dialog"
			aria-modal="true"
			tabindex="-1"
		>
			<div class="flex items-center space-x-3">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
				<span class="text-white">Загрузка просмотрщика...</span>
			</div>
		</div>
	{/if}
{/if}