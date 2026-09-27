<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Icon from '@iconify/svelte';
	import { getCategoryIcon, getUIIcon } from '$lib/icons';
	import { CATEGORY_ORDER, categoryNames } from '$lib/utils/categories';
	import { getRandomEntry } from '$lib/client-data.js';
	import InstallButton from '$lib/components/pwa/InstallButton.svelte';
	import { onMount } from 'svelte';

	interface Props {
		extraClass?: string;
	}

	let { extraClass = '' }: Props = $props();

	let searchQuery = $state('');
	let searchInput: HTMLInputElement;
	let drawerOpen = $state(false);
	let menuOpen = $state(false);
	let scrolled = $state(false);

	onMount(() => {
		const onScroll = () => (scrolled = window.scrollY > 8);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });

		const onKeydown = (event: KeyboardEvent) => {
			const target = event.target as HTMLElement | null;
			const typing =
				target instanceof HTMLInputElement ||
				target instanceof HTMLTextAreaElement ||
				target?.isContentEditable;

			if (event.key === '/' && !typing) {
				event.preventDefault();
				searchInput?.focus();
			}
			if (event.key === 'Escape') {
				drawerOpen = false;
				menuOpen = false;
			}
		};
		window.addEventListener('keydown', onKeydown);

		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('keydown', onKeydown);
		};
	});

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(resolve(`/search?q=${encodeURIComponent(searchQuery)}`));
			drawerOpen = false;
		}
	}

	function randomArticle() {
		try {
			const entry = getRandomEntry();
			if (entry) {
				menuOpen = false;
				drawerOpen = false;
				goto(resolve(`/${entry.category}/${entry.slug}`));
			}
		} catch (error) {
			console.error('Error getting random article:', error);
		}
	}
</script>

<header
	id="main-header"
	data-scrolled={scrolled}
	class="sticky top-0 z-40 border-b border-line bg-ink-850/80 backdrop-blur-md {extraClass}"
>
	<div class="mx-auto max-w-7xl px-4">
		<div class="flex h-[68px] items-center gap-3">
			<!-- Wordmark -->
			<a
				href={resolve('/')}
				class="brand-mark flex items-center gap-3"
				aria-label="Азария — на главную"
			>
				<span
					class="grid size-[34px] rotate-45 place-items-center border border-line-strong bg-ink-800"
				>
					<Icon icon={getUIIcon('slot')} width="17" class="-rotate-45 text-brass" />
				</span>
				<span class="leading-none">
					<span class="block font-display text-xl text-parchment">Азария</span>
					<span class="eyebrow mt-0.5 hidden whitespace-nowrap sm:block">Медивал-деп-панк вики</span
					>
				</span>
			</a>

			<!-- Desktop navigation -->
			<nav class="ml-6 hidden items-center gap-5 lg:flex" aria-label="Разделы">
				{#each CATEGORY_ORDER as category (category)}
					{@const isActive = $page.url.pathname.startsWith(`/${category}`)}
					<a
						href={resolve(`/${category}` as `/${string}`)}
						class="nav-link"
						class:nav-link--active={isActive}
						data-seal={category}
						aria-current={isActive ? 'page' : undefined}
					>
						<Icon icon={getCategoryIcon(category)} width="14" class="seal-text" />
						{categoryNames[category].plural}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-2">
				<!-- Search -->
				<form
					onsubmit={(event) => {
						event.preventDefault();
						handleSearch();
					}}
					class="relative hidden sm:block"
				>
					<Icon
						icon={getUIIcon('search')}
						width="15"
						class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-parchment-mute"
					/>
					<input
						bind:this={searchInput}
						bind:value={searchQuery}
						class="input w-40 pr-10 pl-9 md:w-56"
						type="search"
						placeholder="Поиск…"
						aria-label="Поиск по статьям"
					/>
					<kbd
						class="folio pointer-events-none absolute top-1/2 right-2.5 hidden -translate-y-1/2 md:block"
					>
						/
					</kbd>
				</form>

				<button
					type="button"
					class="icon-btn"
					onclick={randomArticle}
					title="Случайная запись"
					aria-label="Случайная запись"
				>
					<Icon icon={getUIIcon('dice')} width="17" />
				</button>

				<!-- Overflow menu -->
				<div class="relative hidden md:block">
					<button
						type="button"
						class="icon-btn"
						onclick={() => (menuOpen = !menuOpen)}
						aria-expanded={menuOpen}
						aria-haspopup="true"
						title="Ещё"
						aria-label="Ещё"
					>
						<Icon icon={getUIIcon('menu')} width="17" />
					</button>
					{#if menuOpen}
						<div
							class="frame absolute right-0 mt-2 w-56 p-2"
							role="menu"
							tabindex="-1"
							onfocusout={(event) => {
								if (!event.currentTarget.contains(event.relatedTarget as Node)) menuOpen = false;
							}}
						>
							<div class="relative z-10 flex flex-col">
								<a
									role="menuitem"
									href={resolve('/admin')}
									class="px-3 py-2 text-sm text-parchment-dim hover:bg-ink-700/60 hover:text-brass-bright"
								>
									<Icon icon="mdi:cog" width="15" class="mr-2 inline" />
									Служебный вход
								</a>
								<a
									role="menuitem"
									href={resolve('/search')}
									class="px-3 py-2 text-sm text-parchment-dim hover:bg-ink-700/60 hover:text-brass-bright"
								>
									<Icon icon={getUIIcon('search')} width="15" class="mr-2 inline" />
									Все записи
								</a>
								<div class="mt-1 border-t border-line px-1 pt-2">
									<InstallButton />
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Mobile menu toggle -->
				<button
					type="button"
					class="icon-btn lg:hidden"
					onclick={() => (drawerOpen = !drawerOpen)}
					aria-expanded={drawerOpen}
					aria-controls="mobile-nav"
					aria-label="Меню"
				>
					<Icon icon={drawerOpen ? getUIIcon('close') : getUIIcon('menu')} width="17" />
				</button>
			</div>
		</div>

		<!-- Mobile drawer -->
		{#if drawerOpen}
			<div id="mobile-nav" class="border-t border-line pb-4 lg:hidden">
				<form
					onsubmit={(event) => {
						event.preventDefault();
						handleSearch();
					}}
					class="relative mt-4 sm:hidden"
				>
					<Icon
						icon={getUIIcon('search')}
						width="15"
						class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-parchment-mute"
					/>
					<input
						bind:value={searchQuery}
						class="input pl-9"
						type="search"
						placeholder="Поиск…"
						aria-label="Поиск по статьям"
					/>
				</form>

				<nav class="mt-4 grid gap-1" aria-label="Разделы">
					{#each CATEGORY_ORDER as category (category)}
						{@const isActive = $page.url.pathname.startsWith(`/${category}`)}
						<a
							href={resolve(`/${category}` as `/${string}`)}
							class="nav-link-mobile flex items-center gap-3 border-b border-line px-2 py-3 text-parchment-dim hover:text-brass-bright"
							class:text-brass-bright={isActive}
							data-seal={category}
							aria-current={isActive ? 'page' : undefined}
						>
							<Icon icon={getCategoryIcon(category)} width="16" class="seal-text" />
							{categoryNames[category].plural}
							{#if isActive}
								<span class="folio ml-auto">вы здесь</span>
							{/if}
						</a>
					{/each}
				</nav>

				<div class="mt-4 flex items-center gap-2">
					<button type="button" class="btn flex-1" onclick={randomArticle}>
						<Icon icon={getUIIcon('dice')} width="15" />
						Спинануть судьбу
					</button>
					<a href={resolve('/admin')} class="btn btn--quiet">
						<Icon icon="mdi:cog" width="15" />
					</a>
				</div>
			</div>
		{/if}
	</div>
</header>
