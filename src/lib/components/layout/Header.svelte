<script>
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Icon from '@iconify/svelte';
	
	let searchQuery = '';
	
	async function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery)}`);
		}
	}
	
	async function randomArticle() {
		try {
			const response = await fetch('/api/random-article');
			const data = await response.json();
			if (data.url) {
				goto(data.url);
			}
		} catch (error) {
			console.error('Error fetching random article:', error);
		}
	}
</script>

<header class="azaria-card border-b-2" style="border-bottom-color: #c9a876; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);">
	<div class="container mx-auto px-4 py-4">
		<div class="flex items-center justify-between">
			<!-- Logo and Title -->
			<div class="flex items-center space-x-4">
				<a href="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
					<div class="text-4xl">🎰</div>
					<div>
						<h1 style="font-size: 1.875rem; font-family: 'Cinzel Decorative', serif; font-weight: bold; color: #c9a876;">
							Азария
						</h1>
						<p style="font-size: 0.875rem; color: rgba(208, 208, 208, 0.7); font-family: 'Lora', serif;">
							Медивал-деп-панк вики
						</p>
					</div>
				</a>
			</div>
			
			<!-- Navigation -->
			<nav class="hidden md:flex items-center space-x-6">
				<a href="/characters" class="nav-link" class:active={$page.url.pathname.startsWith('/characters')}>
					<Icon icon="mdi:crown" width="16" class="inline mr-1" /> Персонажи
				</a>
				<a href="/locations" class="nav-link" class:active={$page.url.pathname.startsWith('/locations')}>
					<Icon icon="mdi:castle" width="16" class="inline mr-1" /> Локации
				</a>
				<a href="/factions" class="nav-link" class:active={$page.url.pathname.startsWith('/factions')}>
					<Icon icon="mdi:sword-cross" width="16" class="inline mr-1" /> Фракции
				</a>
				<a href="/artifacts" class="nav-link" class:active={$page.url.pathname.startsWith('/artifacts')}>
					<Icon icon="mdi:star-four-points" width="16" class="inline mr-1" /> Артефакты
				</a>
				<a href="/concepts" class="nav-link" class:active={$page.url.pathname.startsWith('/concepts')}>
					<Icon icon="mdi:target" width="16" class="inline mr-1" /> Концепции
				</a>
				<a href="/creatures" class="nav-link" class:active={$page.url.pathname.startsWith('/creatures')}>
					<Icon icon="mdi:dragon" width="16" class="inline mr-1" /> Существа
				</a>
			</nav>
			
			<!-- Search and Random -->
			<div class="flex items-center space-x-4">
				<form on:submit|preventDefault={handleSearch} class="flex items-center">
					<input 
						type="text" 
						bind:value={searchQuery}
						placeholder="Поиск в Азарии..."
						class="azaria-input w-48"
					/>
					<button type="submit" class="azaria-btn ml-2" style="padding: 0.5rem 1rem;">
						<Icon icon="mdi:magnify" width="16" />
					</button>
				</form>
				
				<button 
					on:click={randomArticle}
					class="azaria-btn" 
					style="padding: 0.5rem 1rem;"
					title="Рулетка судьбы"
				>
					<Icon icon="mdi:dice-6" width="16" />
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		<div class="md:hidden mt-4">
			<div class="grid grid-cols-3 gap-2 text-sm">
				<a href="/characters" class="nav-link-mobile"><Icon icon="mdi:crown" width="14" class="inline mr-1" /> Персонажи</a>
				<a href="/locations" class="nav-link-mobile"><Icon icon="mdi:castle" width="14" class="inline mr-1" /> Локации</a>
				<a href="/factions" class="nav-link-mobile"><Icon icon="mdi:sword-cross" width="14" class="inline mr-1" /> Фракции</a>
				<a href="/artifacts" class="nav-link-mobile"><Icon icon="mdi:star-four-points" width="14" class="inline mr-1" /> Артефакты</a>
				<a href="/concepts" class="nav-link-mobile"><Icon icon="mdi:target" width="14" class="inline mr-1" /> Концепции</a>
				<a href="/creatures" class="nav-link-mobile"><Icon icon="mdi:dragon" width="14" class="inline mr-1" /> Существа</a>
			</div>
		</div>
	</div>
</header>

<style>
	.nav-link {
		color: #d0d0d0;
		transition: color 0.3s ease;
		font-family: 'Lora', serif;
	}
	
	.nav-link:hover {
		color: #c9a876;
	}
	
	.nav-link.active {
		color: #c9a876;
		text-shadow: 0 0 3px rgba(201, 168, 118, 0.3);
	}
	
	.nav-link-mobile {
		color: #d0d0d0;
		transition: color 0.3s ease;
		font-family: 'Lora', serif;
		text-align: center;
		padding: 0.5rem 0.25rem;
		border-radius: 0.25rem;
	}
	
	.nav-link-mobile:hover {
		color: #c9a876;
	}
</style>