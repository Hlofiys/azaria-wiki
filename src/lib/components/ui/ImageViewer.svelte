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

<svelte:window onkeydown={handleKeydown} onmouseup={handleMouseUp} onmousemove={handleMouseMove} />

{#if $imageViewer.isOpen && $imageViewer.src}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		class="viewer-overlay"
		role="dialog"
		aria-modal="true"
		tabindex="-1"
		onclick={(event) => {
			// Close only when clicking the backdrop itself, not the image or controls
			if (event.target === event.currentTarget) close();
		}}
		onwheel={handleWheel}
	>
		<div class="viewer-content">
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={$imageViewer.src}
				alt="Fullscreen view"
				style:transform="translate({posX}px, {posY}px) scale({scale})"
				style:cursor={scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'}
				onmousedown={handleMouseDown}
			/>
		</div>

		<div class="controls-toolbar">
			<button onclick={zoomOut} aria-label="Уменьшить" disabled={scale <= 1}>
				<Icon icon={getUIIcon('zoom-out')} />
			</button>
			<button onclick={reset} aria-label="Сбросить масштаб">
				<Icon icon={getUIIcon('zoom-reset')} />
			</button>
			<button onclick={zoomIn} aria-label="Увеличить">
				<Icon icon={getUIIcon('zoom-in')} />
			</button>
		</div>

		<button class="close-button" onclick={close} aria-label="Закрыть просмотр">
			<Icon icon={getUIIcon('close')} />
		</button>
	</div>
{/if}

<style>
	.viewer-overlay {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: rgb(23 18 27 / 0.88);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		animation: fadeIn 0.25s ease;
		overflow: hidden;
	}

	.viewer-content {
		display: flex;
		width: 100%;
		height: 100%;
		align-items: center;
		justify-content: center;
	}

	img {
		max-width: 90vw;
		max-height: 88vh;
		object-fit: contain;
		border: 1px solid var(--color-line-strong);
		border-radius: 3px;
		box-shadow: var(--shadow-lift);
		transition: transform 0.2s ease-out;
		will-change: transform;
	}

	.close-button,
	.controls-toolbar button {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-parchment-dim);
		background: rgb(32 24 38 / 0.85);
		border: 1px solid var(--color-line-strong);
		border-radius: 3px;
		cursor: pointer;
		transition:
			color 0.18s ease,
			background-color 0.18s ease,
			border-color 0.18s ease;
	}

	.controls-toolbar button:hover,
	.close-button:hover {
		color: var(--color-brass-bright);
		border-color: var(--color-brass);
		background: rgb(42 33 48 / 0.95);
	}

	.controls-toolbar button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.close-button {
		position: absolute;
		top: 1rem;
		right: 1rem;
		width: 2.5rem;
		height: 2.5rem;
	}

	.controls-toolbar {
		position: absolute;
		bottom: 1.25rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.5rem;
		padding: 0.5rem;
		background: rgb(32 24 38 / 0.85);
		border: 1px solid var(--color-line);
		border-radius: 3px;
		box-shadow: var(--shadow-panel);
	}

	.controls-toolbar button {
		width: 2.75rem;
		height: 2.75rem;
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
