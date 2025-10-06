<script lang="ts">
	import { Icon, getCategoryIcon, getCategoryColors } from '$lib/icons';
	import { resolve } from '$app/paths';
	import { isFullscreen } from '$lib/stores';
	import type { EntryMetadata, EntryListItem } from '$lib/server/lore-parser';

	export let entry: EntryMetadata;
	export let backlinks: EntryListItem[] = [];

	$: colors = getCategoryColors(entry.category);

	let showImageModal = false;
	let imageZoom = 1;
	let initialImageZoom = 1;
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let imagePosition = { x: 0, y: 0 };
	let imageElement: HTMLImageElement;
	let lastTouchDistance = 0;
	let lastTouchCenter = { x: 0, y: 0 };

	function openImageModal() {
		if (!entry.image) return;

		const img = new Image();
		img.src = entry.image;
		img.onload = () => {
			const imageWidth = img.naturalWidth;
			const imageHeight = img.naturalHeight;

			// Mobile-friendly viewport calculation
			const isMobile = window.innerWidth <= 768;
			const marginFactor = isMobile ? 0.95 : 0.9; // Less margin on mobile
			const viewportWidth = window.innerWidth * marginFactor;
			const viewportHeight = window.innerHeight * marginFactor;

			const widthRatio = viewportWidth / imageWidth;
			const heightRatio = viewportHeight / imageHeight;

			// Set the initial zoom to fit the screen, with minimum zoom for mobile
			const minZoom = isMobile ? 0.8 : 0.5;
			initialImageZoom = Math.max(minZoom, Math.min(widthRatio, heightRatio, 1));
			imageZoom = initialImageZoom;
			imagePosition = { x: 0, y: 0 };

			showImageModal = true;
			document.body.style.overflow = 'hidden';
			
			// Smart scroll positioning: only scroll if modal wouldn't be properly visible
			const currentScrollY = window.scrollY;
			const currentViewportHeight = window.innerHeight;
			const documentHeight = document.documentElement.scrollHeight;
			
			// Check if we're in the bottom half of the page
			const isInBottomHalf = currentScrollY > (documentHeight - currentViewportHeight) / 2;
			
			// If we're in the bottom half, scroll to a position that centers the modal
			if (isInBottomHalf) {
				// Calculate optimal scroll position to center the modal in viewport
				const optimalScrollY = Math.max(0, currentScrollY - currentViewportHeight * 0.2);
				window.scrollTo({ top: optimalScrollY, behavior: 'smooth' });
			}
			// If we're in the top half, don't scroll - modal will be visible
			
			isFullscreen.set(true);
		};
	}

	function closeImageModal() {
		showImageModal = false;
		document.body.style.overflow = 'auto';
		isFullscreen.set(false);
		imagePosition = { x: 0, y: 0 };
		// Reset zoom state for the next time the modal is opened
		initialImageZoom = 1;
		imageZoom = 1;
	}

	function handleImageWheel(event: WheelEvent) {
		event.preventDefault();
		const zoomFactor = event.deltaY > 0 ? 0.9 : 1.1;
		imageZoom = Math.max(0.5, Math.min(5, imageZoom * zoomFactor));
	}

	function handleImageMouseDown(event: MouseEvent) {
		if (imageZoom > 1) {
			isDragging = true;
			dragStart = { x: event.clientX - imagePosition.x, y: event.clientY - imagePosition.y };
			event.preventDefault();
		}
	}

	function handleImageMouseMove(event: MouseEvent) {
		if (isDragging && imageZoom > 1) {
			imagePosition = {
				x: event.clientX - dragStart.x,
				y: event.clientY - dragStart.y
			};
		}
	}

	function handleImageMouseUp() {
		isDragging = false;
	}

	function handleImageDoubleClick() {
		// If at initial zoom, zoom in. Otherwise, reset.
		if (imageZoom === initialImageZoom) {
			imageZoom = Math.min(initialImageZoom * 2, 5); // Zoom in, but not more than 5x
		} else {
			imageZoom = initialImageZoom;
			imagePosition = { x: 0, y: 0 };
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeImageModal();
		}
	}

	function handleBackgroundClick(event: MouseEvent) {
		// Close modal when clicking outside the image
		const target = event.target as HTMLElement;
		
		// Don't close if clicking on image, controls, or buttons
		if (target.tagName === 'IMG' || 
			target.tagName === 'BUTTON' || 
			target.closest('button') || 
			target.closest('[role="button"]')) {
			return;
		}
		
		closeImageModal();
	}

	// Touch event handlers for mobile
	function getTouchDistance(touches: TouchList) {
		if (touches.length < 2) return 0;
		const touch1 = touches[0];
		const touch2 = touches[1];
		return Math.sqrt(
			Math.pow(touch2.clientX - touch1.clientX, 2) + 
			Math.pow(touch2.clientY - touch1.clientY, 2)
		);
	}

	function getTouchCenter(touches: TouchList) {
		if (touches.length === 1) {
			return { x: touches[0].clientX, y: touches[0].clientY };
		}
		if (touches.length >= 2) {
			return {
				x: (touches[0].clientX + touches[1].clientX) / 2,
				y: (touches[0].clientY + touches[1].clientY) / 2
			};
		}
		return { x: 0, y: 0 };
	}

	function handleTouchStart(event: TouchEvent) {
		event.preventDefault();
		
		if (event.touches.length === 1) {
			// Single touch - start dragging
			if (imageZoom > 1) {
				isDragging = true;
				const touch = event.touches[0];
				dragStart = { x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y };
			}
		} else if (event.touches.length === 2) {
			// Two touches - start pinch zoom
			isDragging = false;
			lastTouchDistance = getTouchDistance(event.touches);
			lastTouchCenter = getTouchCenter(event.touches);
		}
	}

	function handleTouchMove(event: TouchEvent) {
		event.preventDefault();
		
		if (event.touches.length === 1 && isDragging && imageZoom > 1) {
			// Single touch drag
			const touch = event.touches[0];
			imagePosition = {
				x: touch.clientX - dragStart.x,
				y: touch.clientY - dragStart.y
			};
		} else if (event.touches.length === 2) {
			// Pinch zoom
			const currentDistance = getTouchDistance(event.touches);
			const currentCenter = getTouchCenter(event.touches);
			
			if (lastTouchDistance > 0) {
				const zoomFactor = currentDistance / lastTouchDistance;
				imageZoom = Math.max(0.5, Math.min(5, imageZoom * zoomFactor));
			}
			
			lastTouchDistance = currentDistance;
			lastTouchCenter = currentCenter;
		}
	}

	function handleTouchEnd(event: TouchEvent) {
		if (event.touches.length === 0) {
			isDragging = false;
			lastTouchDistance = 0;
		}
	}
</script>

<div class="sticky top-4 lg:top-6">
	<div
		class="relative overflow-hidden rounded-lg"
		style="
			border: 2px solid {colors.border}80;
			background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3), 0 0 8px {colors.glow}40;
		"
	>
		<!-- Subtle category background -->
		<div
			class="absolute inset-0 opacity-5"
			style="background: linear-gradient(135deg, {colors.bg} 0%, transparent 50%, {colors.bg} 100%);"
		></div>

		<div class="relative z-10 p-3 sm:p-4 md:p-6">
			<!-- Title with Icon -->
			<h2
				class="card-title font-heading mb-3 text-lg md:mb-4 md:text-xl"
				style="color: {colors.primary}; text-shadow: 0 0 6px {colors.glow};"
			>
				<div class="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
					<Icon
						icon={getCategoryIcon(entry.category)}
						class="h-5 w-5 md:h-6 md:w-6"
						style="color: {colors.primary};"
					/>
					<span class="break-words">{entry.title}</span>
				</div>
			</h2>

			<!-- Main Image -->
			{#if entry.image}
				<div class="mb-3 md:mb-4">
					<button
						on:click={openImageModal}
						class="w-full cursor-zoom-in transition-transform hover:scale-105"
					>
						<img
							src={entry.image}
							alt={entry.title}
							class="w-full rounded-lg object-cover"
							style="
								max-height: 200px;
								border: 2px solid {colors.border}60;
								box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
							"
							loading="lazy"
							on:error={(e) => {
								// Hide image if it fails to load
								const target = e.target as HTMLImageElement;
								if (target && target.style) {
									target.style.display = 'none';
								}
							}}
						/>
					</button>
				</div>
			{/if}

			<!-- Information Table -->
			<div class="overflow-x-auto">
				<table class="table-compact table w-full text-xs sm:text-sm">
					<tbody>
						<tr>
							<td class="text-azaria-gold font-semibold">Категория</td>
							<td class="text-azaria-text">{entry.category}</td>
						</tr>

						{#if entry.faction}
							<tr>
								<td class="text-azaria-gold font-semibold">Фракция</td>
								<td class="text-azaria-text">{entry.faction}</td>
							</tr>
						{/if}

						{#if entry.type}
							<tr>
								<td class="text-azaria-gold font-semibold">Тип</td>
								<td class="text-azaria-text">{entry.type}</td>
							</tr>
						{/if}

						{#if entry.status}
							<tr>
								<td class="text-azaria-gold font-semibold">Статус</td>
								<td class="text-azaria-text">
									<span
										class:text-green-400={entry.status === 'Alive'}
										class:text-red-400={entry.status === 'Deceased'}
									>
										{entry.status}
									</span>
								</td>
							</tr>
						{/if}

						{#if entry.age}
							<tr>
								<td class="text-azaria-gold font-semibold">Возраст</td>
								<td class="text-azaria-text">{entry.age} лет</td>
							</tr>
						{/if}

						{#if entry.population}
							<tr>
								<td class="text-azaria-gold font-semibold">Население</td>
								<td class="text-azaria-text">{entry.population}</td>
							</tr>
						{/if}

						{#if entry.ruler}
							<tr>
								<td class="text-azaria-gold font-semibold">Правитель</td>
								<td class="text-azaria-text">{entry.ruler}</td>
							</tr>
						{/if}

						{#if entry.owner}
							<tr>
								<td class="text-azaria-gold font-semibold">Владелец</td>
								<td class="text-azaria-text">{entry.owner}</td>
							</tr>
						{/if}

						{#if entry.realm}
							<tr>
								<td class="text-azaria-gold font-semibold">Realm</td>
								<td class="text-azaria-text">{entry.realm}</td>
							</tr>
						{/if}

						{#if entry.length}
							<tr>
								<td class="text-azaria-gold font-semibold">Протяженность</td>
								<td class="text-azaria-text">{entry.length}</td>
							</tr>
						{/if}

						{#if entry.effect}
							<tr>
								<td class="text-azaria-gold font-semibold">Эффект</td>
								<td class="text-azaria-text">{entry.effect}</td>
							</tr>
						{/if}

						{#if entry.description}
							<tr>
								<td class="text-azaria-gold font-semibold">Описание</td>
								<td class="text-azaria-text">{entry.description}</td>
							</tr>
						{/if}

						{#if entry.creator}
							<tr>
								<td class="text-azaria-gold font-semibold">Создатель</td>
								<td class="text-azaria-text">{entry.creator}</td>
							</tr>
						{/if}

						{#if entry.era}
							<tr>
								<td class="text-azaria-gold font-semibold">Эпоха</td>
								<td class="text-azaria-text">{entry.era}</td>
							</tr>
						{/if}

						{#if entry.nickname}
							<tr>
								<td class="text-azaria-gold font-semibold">Прозвище</td>
								<td class="text-azaria-text">"{entry.nickname}"</td>
							</tr>
						{/if}

						{#if entry.feature}
							<tr>
								<td class="text-azaria-gold font-semibold">Особенность</td>
								<td class="text-azaria-text">{entry.feature}</td>
							</tr>
						{/if}

						{#if entry.access}
							<tr>
								<td class="text-azaria-gold font-semibold">Доступ</td>
								<td class="text-azaria-text">{entry.access}</td>
							</tr>
						{/if}

						{#if entry.members}
							<tr>
								<td class="text-azaria-gold font-semibold">Члены</td>
								<td class="text-azaria-text">{entry.members}</td>
							</tr>
						{/if}

						{#if entry.philosophy}
							<tr>
								<td class="text-azaria-gold font-semibold">Философия</td>
								<td class="text-azaria-text">{entry.philosophy}</td>
							</tr>
						{/if}

						{#if entry.specialization}
							<tr>
								<td class="text-azaria-gold font-semibold">Специализация</td>
								<td class="text-azaria-text">{entry.specialization}</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>

			<!-- Tags -->
			{#if entry.tags && entry.tags.length > 0}
				<div class="mt-3 md:mt-4">
					<h4 class="text-azaria-gold mb-2 text-sm font-semibold">Теги</h4>
					<div class="flex flex-wrap gap-1">
						{#each entry.tags as tag (tag)}
							<span class="badge badge-outline border-azaria-gold/50 text-azaria-text text-xs">
								{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Referenced In (Backlinks) -->
			{#if backlinks && backlinks.length > 0}
				<div class="mt-3 md:mt-4">
					<h4 class="text-azaria-gold mb-2 text-sm font-semibold">Упоминается в</h4>
					<div class="space-y-1">
						{#each backlinks.slice(0, 5) as backlink (backlink.slug)}
							<a
								href={resolve(`/${backlink.category}/${backlink.slug}` as `/${string}/${string}`)}
								class="text-azaria-text hover:text-azaria-gold block text-xs transition-colors sm:text-sm"
							>
								• {backlink.title}
							</a>
						{/each}
						{#if backlinks.length > 5}
							<p class="text-azaria-text/50 text-xs">
								И еще {backlinks.length - 5} статей...
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Image Modal -->
{#if showImageModal && entry.image}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center"
		on:click={handleBackgroundClick}
		on:keydown={handleKeydown}
		role="dialog"
		aria-modal="true"
		aria-label="Увеличенное изображение {entry.title}"
		tabindex="-1"
		style="
			position: fixed !important;
			top: 0 !important;
			left: 0 !important;
			right: 0 !important;
			bottom: 0 !important;
			width: 100vw !important;
			height: 100vh !important;
			background-color: rgba(0, 0, 0, 0.3) !important;
			backdrop-filter: blur(12px) !important;
			-webkit-backdrop-filter: blur(12px) !important;
			z-index: 999999 !important;
		"
	>
		<!-- Close button -->
		<button
			on:click={closeImageModal}
			class="absolute top-4 right-4 sm:top-6 sm:right-6 z-[100] flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white transition-all duration-200 hover:bg-opacity-80"
			style="background-color: rgba(0, 0, 0, 0.8);"
			aria-label="Закрыть изображение"
			title="Закрыть изображение"
		>
			<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				></path>
			</svg>
		</button>

		<!-- Centered image container with margins -->
		<div
			class="relative flex items-center justify-center p-4 sm:p-8 md:p-12 lg:p-16"
			style="width: 100vw; height: 100vh;"
			on:mousemove={handleImageMouseMove}
			on:mouseup={handleImageMouseUp}
			on:touchstart={handleTouchStart}
			on:touchmove={handleTouchMove}
			on:touchend={handleTouchEnd}
			role="presentation"
		>
			<!-- Zoomable image -->
			<div class="relative max-h-full max-w-full overflow-hidden">
				<button
					type="button"
					class="relative block max-h-full max-w-full border-0 bg-transparent p-0 transition-transform duration-200 select-none focus:outline-none touch-none"
					style="
						transform: scale({imageZoom}) translate({imagePosition.x / imageZoom}px, {imagePosition.y / imageZoom}px);
						cursor: {imageZoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'};
						display: flex;
						align-items: center;
						justify-content: center;
						-webkit-user-select: none;
						-webkit-touch-callout: none;
					"
					on:wheel={handleImageWheel}
					on:mousedown={handleImageMouseDown}
					on:dblclick={handleImageDoubleClick}
					on:click={(e) => {
						e.stopPropagation();
						if (imageZoom === initialImageZoom) {
							closeImageModal();
						}
					}}
					aria-label="Изображение. Колесико мыши для масштабирования, двойной клик для увеличения, клик для закрытия"
				>
					<img
						bind:this={imageElement}
						src={entry.image}
						alt={entry.title}
						class="max-h-full max-w-full rounded-lg object-contain shadow-2xl"
						style="
							box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
							-webkit-user-drag: none;
							-webkit-user-select: none;
							user-select: none;
						"
						draggable="false"
					/>
				</button>
			</div>
		</div>

		<!-- Zoom controls -->
		<div class="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex gap-2">
			<button
				type="button"
				class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white text-lg sm:text-xl transition-all duration-200 hover:bg-opacity-80 active:scale-95"
				style="background-color: rgba(0, 0, 0, 0.8);"
				on:click={(e) => {
					e.stopPropagation();
					imageZoom = Math.max(0.5, imageZoom * 0.8);
				}}
				aria-label="Уменьшить"
			>
				−
			</button>
			<button
				type="button"
				class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white text-lg sm:text-xl transition-all duration-200 hover:bg-opacity-80 active:scale-95"
				style="background-color: rgba(0, 0, 0, 0.8);"
				on:click={(e) => {
					e.stopPropagation();
					imageZoom = Math.min(5, imageZoom * 1.25);
				}}
				aria-label="Увеличить"
			>
				+
			</button>
			<button
				type="button"
				class="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full text-white text-lg sm:text-xl transition-all duration-200 hover:bg-opacity-80 active:scale-95"
				style="background-color: rgba(0, 0, 0, 0.8);"
				on:click={(e) => {
					e.stopPropagation();
					imageZoom = initialImageZoom;
					imagePosition = { x: 0, y: 0 };
				}}
				aria-label="Сбросить масштаб"
			>
				⌂
			</button>
		</div>
	</div>
{/if}
