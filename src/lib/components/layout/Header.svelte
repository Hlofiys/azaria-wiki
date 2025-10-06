<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { getCategoryColors, getCategoryIcon } from '$lib/icons';
	import type { CategoryType } from '$lib/icons';
	import { getRandomEntry } from '$lib/client-data.js';
	import InstallButton from '$lib/components/pwa/InstallButton.svelte';

	let searchQuery = '';
	let mobileMenuOpen = false;

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

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
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
		background-color: rgba(36, 36, 36, 0.8);
		-webkit-backdrop-filter: blur(8px);
		backdrop-filter: blur(8px);
		border-bottom-color: #c9a876;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);
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
			<nav class="hidden items-center space-x-6 md:flex">
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
				<!-- Mobile Menu Toggle (visible only on mobile) -->
				<button
					on:click={toggleMobileMenu}
					class="azaria-btn md:hidden"
					style="padding: 0.5rem 0.75rem;"
					title="Меню"
					aria-label="Toggle mobile menu"
				>
					<Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} width="16" />
				</button>

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

		<!-- Mobile Navigation -->
		{#if mobileMenuOpen}
			<div class="mt-4 md:hidden mobile-nav-dropdown">
				<div class="grid grid-cols-2 gap-2 text-xs">
					{#each navItems as item (item.href)}
						{@const colors = getCategoryColors(item.category)}
						{@const isActive = $page.url.pathname.startsWith(item.href)}
						<a
							href={resolve(item.href as `/${string}`)}
							class="nav-link-mobile flex flex-col items-center justify-center p-2 transition-all duration-300 hover:scale-105"
							class:active={isActive}
							style="
								color: {isActive ? colors.primary : '#d0d0d0'};
								border: 1px solid {isActive ? colors.border : 'rgba(201, 168, 118, 0.2)'};
								background: {isActive ? colors.bg : 'transparent'};
								border-radius: 0.375rem;
							"
							on:click={closeMobileMenu}
							on:mouseenter={(e) => {
								e.currentTarget.style.backgroundColor = colors.bg;
								e.currentTarget.style.borderColor = colors.border;
								e.currentTarget.style.boxShadow = `0 0 8px ${colors.glow}`;
							}}
							on:mouseleave={(e) => {
								if (!isActive) {
									e.currentTarget.style.backgroundColor = 'transparent';
									e.currentTarget.style.borderColor = 'rgba(201, 168, 118, 0.2)';
									e.currentTarget.style.boxShadow = 'none';
								}
							}}
						>
							<Icon
								icon={getCategoryIcon(item.category)}
								width="16"
								class="mb-1 transition-colors duration-150"
								style="color: {isActive ? colors.primary : colors.secondary} !important;"
							/>
							<span class="text-center">{item.label}</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</header>

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

	.nav-link-mobile {
		color: #d0d0d0;
		transition:
			color 0.15s ease,
			background-color 0.3s ease,
			border-color 0.3s ease,
			box-shadow 0.3s ease;
		font-family: 'Lora', serif;
		text-align: center;
		padding: 0.5rem 0.25rem;
		border-radius: 0.25rem;
	}

	.nav-link-mobile:hover {
		color: #c9a876;
	}

	/* Ensure mobile icon colors update instantly */
	.nav-link-mobile :global(svg) {
		transition: color 0.1s ease !important;
	}

	.nav-link-mobile.active :global(svg) {
		transition: none !important;
	}

	/* Mobile navigation dropdown animation */
	.mobile-nav-dropdown {
		animation: slideDown 0.3s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Improve mobile header compactness */
	@media (max-width: 768px) {
		header {
			padding-bottom: 0.75rem !important;
		}
		
		.mobile-nav-dropdown {
			margin-top: 0.75rem;
			padding-bottom: 0.5rem;
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
</style>
