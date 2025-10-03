<script>
	import Infobox from '$lib/components/ui/Infobox.svelte';
	import LoreCard from '$lib/components/ui/LoreCard.svelte';
	import { Icon, getUIIcon } from '$lib/icons.js';
	
	export let data;
	
	// Process content for proper markdown rendering with inline styles
	function processContent(content) {
		return content
			.replace(/<h1>/g, '<h1 style="font-size: 1.875rem; font-family: \'Cinzel Decorative\', serif; color: #c9a876; margin-bottom: 1rem; margin-top: 1.5rem; text-shadow: 0 0 8px rgba(212, 175, 55, 0.3);">')
			.replace(/<h2>/g, '<h2 style="font-size: 1.5rem; font-family: \'Cinzel Decorative\', serif; color: #c9a876; margin-bottom: 0.75rem; margin-top: 1.5rem; text-shadow: 0 0 6px rgba(212, 175, 55, 0.3);">')
			.replace(/<h3>/g, '<h3 style="font-size: 1.25rem; font-family: \'Cinzel Decorative\', serif; color: #c9a876; margin-bottom: 0.5rem; margin-top: 1rem; text-shadow: 0 0 4px rgba(212, 175, 55, 0.3);">')
			.replace(/<h4>/g, '<h4 style="font-size: 1.125rem; font-family: \'Cinzel Decorative\', serif; color: #c9a876; margin-bottom: 0.5rem; margin-top: 1rem;">')
			.replace(/<p>/g, '<p style="margin-bottom: 1rem; color: #d0d0d0; font-family: \'Lora\', serif; line-height: 1.7;">')
			.replace(/<ul>/g, '<ul style="list-style-type: disc; list-style-position: inside; margin-bottom: 1rem; color: #d0d0d0; padding-left: 1rem;">')
			.replace(/<ol>/g, '<ol style="list-style-type: decimal; list-style-position: inside; margin-bottom: 1rem; color: #d0d0d0; padding-left: 1rem;">')
			.replace(/<li>/g, '<li style="margin-bottom: 0.25rem;">')
			.replace(/<strong>/g, '<strong style="color: #c9a876; font-weight: 600;">')
			.replace(/<em>/g, '<em style="color: #f4d03f; font-style: italic;">')
			.replace(/<blockquote>/g, '<blockquote style="border-left: 4px solid #c9a876; padding-left: 1rem; margin: 1rem 0; font-style: italic; color: #f4d03f;">')
			.replace(/class="wiki-link"/g, 'style="color: #c9a876; text-decoration: underline; transition: color 0.3s ease;"')
			.replace(/class="wiki-link-missing"/g, 'style="color: #8b2635; cursor: help; border-bottom: 1px dotted #8b2635;"');
	}
</script>

<svelte:head>
	<title>{data.entry.metadata.title} — Азария Вики</title>
	<meta name="description" content="Информация о {data.entry.metadata.title} в мире Азарии" />
</svelte:head>

<div class="max-w-7xl mx-auto">
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
		<!-- Main Content -->
		<div style="grid-column: span 2; order: 2;">
			<div class="azaria-card">
				<div style="padding: 2rem;">
					<!-- Breadcrumbs -->
					<div style="font-size: 0.875rem; margin-bottom: 1rem;">
						<nav style="color: rgba(226, 213, 199, 0.7);">
							<a href="/" style="color: #c9a876; text-decoration: none;">Главная</a> / 
							<a href="/{data.entry.metadata.category}" style="color: #c9a876; text-decoration: none;">
								{data.entry.metadata.category === 'characters' ? 'Персонажи' :
								 data.entry.metadata.category === 'locations' ? 'Локации' :
								 data.entry.metadata.category === 'factions' ? 'Фракции' :
								 data.entry.metadata.category === 'artifacts' ? 'Артефакты' :
								 data.entry.metadata.category === 'concepts' ? 'Концепции' :
								 data.entry.metadata.category === 'creatures' ? 'Существа' : 
								 data.entry.metadata.category}
							</a> / 
							<span style="color: #c9a876;">{data.entry.metadata.title}</span>
						</nav>
					</div>
					
					<!-- Main Title -->
					<h1 style="font-size: 2.5rem; font-family: 'Cinzel Decorative', serif; color: #c9a876; margin-bottom: 1.5rem; text-shadow: 0 0 12px rgba(212, 175, 55, 0.4);">
						{data.entry.metadata.title}
					</h1>
					
					<!-- Content -->
					<div style="max-width: none;">
						{@html processContent(data.entry.content)}
					</div>
					
					<!-- Navigation -->
					<div class="flex justify-between items-center mt-8 pt-6 border-t border-azaria-gold/30">
						<a 
							href="/{data.entry.metadata.category}" 
							class="btn btn-outline border-azaria-gold text-azaria-gold hover:bg-azaria-gold hover:text-azaria-dark"
						>
							← Назад к {data.entry.metadata.category === 'characters' ? 'персонажам' :
								 data.entry.metadata.category === 'locations' ? 'локациям' :
								 data.entry.metadata.category === 'factions' ? 'фракциям' :
								 data.entry.metadata.category === 'artifacts' ? 'артефактам' :
								 data.entry.metadata.category === 'concepts' ? 'концепциям' :
								 data.entry.metadata.category === 'creatures' ? 'существам' : 
								 data.entry.metadata.category}
						</a>
						
						<button 
							on:click={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
							class="btn btn-ghost text-azaria-gold"
						>
							↑ Наверх
						</button>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Sidebar with Infobox -->
		<div class="lg:col-span-1 order-1 lg:order-2">
			<Infobox entry={data.entry.metadata} backlinks={data.backlinks} />
		</div>
	</div>
	
	<!-- Related Entries (if backlinks exist) -->
	{#if data.backlinks && data.backlinks.length > 0}
		<div class="mt-12">
			<h2 class="text-2xl font-heading text-azaria-gold mb-6">
				<Icon icon={getUIIcon('book')} class="inline mr-2" />
				Связанные статьи
			</h2>
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.backlinks.slice(0, 6) as backlink}
					<LoreCard entry={backlink} showCategory={true} />
				{/each}
			</div>
			
			{#if data.backlinks.length > 6}
				<div class="text-center mt-6">
					<p class="text-azaria-text/70 font-body">
						И еще {data.backlinks.length - 6} связанных статей...
					</p>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	:global(.wiki-link) {
		position: relative;
	}
	
	:global(.wiki-link:hover::after) {
		content: attr(title);
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(42, 13, 46, 0.95);
		color: #f3e9d2;
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid #FFD700;
		font-size: 0.75rem;
		white-space: nowrap;
		z-index: 10;
		pointer-events: none;
	}
	
	:global(.wiki-link-missing) {
		cursor: help;
	}
	
	:global(.wiki-link-missing:hover::after) {
		content: attr(title);
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(200, 30, 30, 0.95);
		color: #f3e9d2;
		padding: 0.5rem;
		border-radius: 0.25rem;
		border: 1px solid #c81e1e;
		font-size: 0.75rem;
		white-space: nowrap;
		z-index: 10;
		pointer-events: none;
	}
</style>