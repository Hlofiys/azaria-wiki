<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { getCategoryColors, getCategoryIcon } from '$lib/icons';
	import type { CategoryType } from '$lib/icons';
	import { getRandomEntry } from '$lib/client-data.js';
	import InstallButton from '$lib/components/pwa/InstallButton.svelte';
	import { onMount } from 'svelte';

	let searchQuery = '';
	let showScrollToTop = $state(false);

	// Navigation items with their categories for coloring
	const navItems: Array<{ href: string; category: CategoryType; label: string }> = [
		{ href: '/characters', category: 'characters', label: 'Персонажи' },
		{ href: '/locations', category: 'locations', label: 'Локации' },
		{ href: '/factions', category: 'factions', label: 'Фракции' },
		{ href: '/artifacts', category: 'artifacts', label: 'Артефакты' },
		{ href: '/concepts', category: 'concepts', label: 'Концепции' },
		{ href: '/creatures', category: 'creatures', label: 'Существа' }
	];

	async function handleSearch() {
		if (searchQuery.trim()) {
			goto(resolve(`/search?q=${encodeURIComponent(searchQuery)}`));
		}
	}

	function randomArticle() {
		try {
			const randomEntry = getRandomEntry();
			if (randomEntry) {
				goto(resolve(`/${randomEntry.category}/${randomEntry.slug}`));
			}
		} catch (error) {
			console.error('Error getting random article:', error);
		}
	}



	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	function handleScroll() {
		showScrollToTop = window.scrollY > 300;
	}

	onMount(() => {
		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<header
	id="main-header"
	class="border-b-2"
	style="
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 10;
		background-color: #242424;
		background-image: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border-bottom-color: #c9a876;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	"
>
	<div class="container mx-auto px-4 py-3 md:py-4">
		<div class="flex flex-col gap-3 md:gap-4 md:flex-row md:items-center md:justify-between">
			<!-- Logo and Title -->
			<div class="flex items-center justify-center space-x-4 md:justify-start">
				<a
					href={resolve('/')}
					class="flex items-center space-x-3 transition-opacity hover:opacity-80"
				>
					<Icon icon="mdi:slot-machine" class="text-azaria-gold text-3xl md:text-4xl" />
					<div>
						<h1
							style="font-size: 1.5rem; font-family: 'Cinzel Decorative', serif; font-weight: bold; color: #c9a876;"
						>
							Азария
						</h1>
						<p
							style="font-size: 0.75rem; color: rgba(208, 208, 208, 0.7); font-family: 'Lora', serif;"
						>
							Медивал-деп-панк вики
						</p>
					</div>
				</a>
			</div>

			<!-- Desktop Navigation -->
			<nav class="flex flex-wrap items-center justify-center gap-2 md:space-x-6 md:gap-0">
				{#each navItems as item (item.href)}
					{@const colors = getCategoryColors(item.category)}
					{@const isActive = $page.url.pathname.startsWith(item.href)}
					<a
						href={resolve(item.href as `/${string}`)}
						class="nav-link hover:bg-opacity-10 rounded px-2 py-1 transition-all duration-300 hover:scale-105"
						class:active={isActive}
						class:nav-active={isActive}
						style="
							color: {isActive ? colors.primary : '#d0d0d0'};
							text-shadow: {isActive ? `0 0 4px ${colors.glow}` : 'none'};
							--hover-bg: {colors.bg};
						"
						on:mouseenter={(e) => {
							e.currentTarget.style.backgroundColor = colors.bg;
							e.currentTarget.style.boxShadow = `0 0 8px ${colors.glow}`;
						}}
						on:mouseleave={(e) => {
							if (!isActive) {
								e.currentTarget.style.backgroundColor = 'transparent';
								e.currentTarget.style.boxShadow = 'none';
							}
						}}
					>
						<Icon
							icon={getCategoryIcon(item.category)}
							width="16"
							class="mr-1 inline transition-colors duration-150"
							style="color: {isActive ? colors.primary : colors.secondary} !important;"
						/>
						{item.label}
					</a>
				{/each}
			</nav>

			<!-- Search, Install, and Actions -->
			<div class="flex items-center justify-center space-x-2 md:justify-end md:space-x-4">

				<!-- Install Button -->
				<InstallButton />
				<form on:submit|preventDefault={handleSearch} class="flex items-center">
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Поиск..."
						class="azaria-input w-20 text-sm md:w-48"
					/>
					<button type="submit" class="azaria-btn ml-1 md:ml-2" style="padding: 0.5rem 0.75rem;">
						<Icon icon="mdi:magnify" width="16" />
					</button>
				</form>

				<button
					on:click={randomArticle}
					class="azaria-btn"
					style="padding: 0.5rem 0.75rem;"
					title="Рулетка судьбы"
				>
					<Icon icon="mdi:dice-6" width="16" />
				</button>

				<a
					href={resolve('/admin')}
					class="azaria-btn"
					style="padding: 0.5rem 0.75rem;"
					title="Административная панель"
				>
					<Icon icon="mdi:cog" width="16" />
				</a>
			</div>
		</div>

	</div>
</header>

<!-- Scroll to Top Button -->
{#if showScrollToTop}
	<button
		class="scroll-to-top-btn"
		on:click={scrollToTop}
		title="Наверх"
		aria-label="Прокрутить наверх"
	>
		<Icon icon="mdi:chevron-up" width="24" />
	</button>
{/if}

<style>
	.nav-link {
		color: #d0d0d0;
		transition:
			color 0.15s ease,
			background-color 0.3s ease,
			box-shadow 0.3s ease;
		font-family: 'Lora', serif;
	}

	.nav-link:hover {
		color: #c9a876;
	}

	.nav-link.active {
		color: #c9a876;
		text-shadow: 0 0 3px rgba(201, 168, 118, 0.3);
	}

	/* Ensure icon colors update instantly */
	.nav-link :global(svg) {
		transition: color 0.1s ease !important;
	}

	.nav-link.active :global(svg) {
		transition: none !important;
	}



	/* Improve mobile header compactness */
	@media (max-width: 768px) {
		header {
			padding-bottom: 0.75rem !important;
		}
		


		/* Make mobile header more compact */
		.container {
			padding-left: 1rem;
			padding-right: 1rem;
		}

		/* Optimize mobile button spacing */
		.azaria-btn {
			padding: 0.4rem 0.6rem !important;
			font-size: 0.875rem;
		}

		/* Smaller logo on mobile */
		h1 {
			font-size: 1.25rem !important;
		}

		/* Compact mobile search */
		.azaria-input {
			padding: 0.5rem !important;
			font-size: 0.875rem;
		}
	}

	/* Extra small mobile devices */
	@media (max-width: 480px) {
		.container {
			padding-left: 0.75rem;
			padding-right: 0.75rem;
		}

		.azaria-btn {
			padding: 0.35rem 0.5rem !important;
			font-size: 0.8rem;
		}

		h1 {
			font-size: 1.125rem !important;
		}

		/* Hide some elements on very small screens to save space */
		.azaria-input {
			width: 4rem !important;
		}
	}

	/* Scroll to Top Button */
	.scroll-to-top-btn {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 50;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		background-color: #242424;
		background-image: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
		color: #c9a876;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		animation: fadeInUp 0.3s ease-out;
		}

		.scroll-to-top-btn:hover {
		background-color: #2a2a2a;
		border-color: #c9a876;
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 0 12px rgba(201, 168, 118, 0.2);
		transform: translateY(-2px);
		color: #e6c190;
		}

		.scroll-to-top-btn:active {
		transform: translateY(0);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		}

		@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
		}

		/* Mobile scroll to top button */
		@media (max-width: 768px) {
		.scroll-to-top-btn {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 2.5rem;
			height: 2.5rem;
		}
		}
	</style>
