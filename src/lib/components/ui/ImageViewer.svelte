<script lang="ts">
	import { imageViewer } from '$lib/stores/imageViewerStore';
	import { Icon, getUIIcon } from '$lib/icons';

	let scale = $state(1);
	let posX = $state(0);
	let posY = $state(0);
	let isDragging = $state(false);
	let startPos = $state({ x: 0, y: 0 });

	function close() {
		imageViewer.close();
		reset(); // Reset state when closing
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') close();
	}

	function handleWheel(event: WheelEvent) {
		event.preventDefault();
		const zoomIntensity = 0.1;
		const newScale = scale - event.deltaY * zoomIntensity * 0.1;
		scale = Math.max(1, newScale); // Prevent zooming out smaller than original
	}

	function handleMouseDown(event: MouseEvent) {
		if (scale <= 1) return;
		isDragging = true;
		startPos = { x: event.clientX - posX, y: event.clientY - posY };
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDragging || scale <= 1) return;
		posX = event.clientX - startPos.x;
		posY = event.clientY - startPos.y;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function zoomIn() {
		scale += 0.2;
	}

	function zoomOut() {
		scale = Math.max(1, scale - 0.2);
	}

	function reset() {
		scale = 1;
		posX = 0;
		posY = 0;
	}

	$effect(() => {
		if ($imageViewer.isOpen) {
			document.documentElement.style.overflow = 'hidden';
		} else {
			document.documentElement.style.overflow = '';
		}
		return () => {
			document.documentElement.style.overflow = '';
		};
	});
</script>

<svelte:window
	on:keydown={handleKeydown}
	on:mouseup={handleMouseUp}
	on:mousemove={handleMouseMove}
/>

{#if $imageViewer.isOpen && $imageViewer.src}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		class="viewer-overlay"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onwheel={handleWheel}
	>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="viewer-content" onclick={(e) => e.stopPropagation()} role="presentation">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={$imageViewer.src}
				alt="Fullscreen view"
				style:transform="translate({posX}px, {posY}px) scale({scale})"
				style:cursor={scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}
				onmousedown={handleMouseDown}
			/>
		</div>

		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="controls-toolbar" onclick={(e) => e.stopPropagation()} role="toolbar" tabindex="-1">
			<button onclick={zoomOut} aria-label="Zoom out" disabled={scale <= 1}>
				<Icon icon={getUIIcon('zoom-out')} />
			</button>
			<button onclick={reset} aria-label="Reset zoom">
				<Icon icon={getUIIcon('zoom-reset')} />
			</button>
			<button onclick={zoomIn} aria-label="Zoom in">
				<Icon icon={getUIIcon('zoom-in')} />
			</button>
		</div>

		<button class="close-button" onclick={close} aria-label="Close image viewer">
			<Icon icon={getUIIcon('close')} />
		</button>
	</div>
{/if}

<style>
	.viewer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		z-index: 5000; /* Extremely high z-index */
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgba(26, 26, 26, 0.7);
		backdrop-filter: blur(8px);
		-webkit-backdrop-filter: blur(8px);
		animation: fadeIn 0.3s ease;
		overflow: hidden; /* Prevents scrollbars on the overlay itself */
	}

	.viewer-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	img {
		max-width: 90vw;
		max-height: 90vh;
		object-fit: contain;
		border-radius: 8px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
		transition: transform 0.2s ease-out; /* Smooths out button zooms */
		will-change: transform;
	}

	.close-button,
	.controls-toolbar button {
		background: rgba(0, 0, 0, 0.6);
		color: white;
		border: 1px solid rgba(255, 255, 255, 0.2);
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition:
			transform 0.2s ease,
			background-color 0.2s ease;
	}
	.controls-toolbar button:hover,
	.close-button:hover {
		background: rgba(0, 0, 0, 0.8);
		transform: scale(1.1);
	}
	.controls-toolbar button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		border-radius: 50%;
		width: 2.5rem;
		height: 2.5rem;
		font-size: 1.5rem;
	}

	.controls-toolbar {
		position: absolute;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		background: rgba(0, 0, 0, 0.6);
		padding: 0.5rem;
		border-radius: 99px;
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.controls-toolbar button {
		width: 3rem;
		height: 3rem;
		font-size: 1.5rem;
		border-radius: 50%;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
