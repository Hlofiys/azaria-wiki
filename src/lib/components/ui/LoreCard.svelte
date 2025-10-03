<script>
	import { Icon, getCategoryIcon, getUIIcon, getCategoryColors, getCategoryNameRussian } from '$lib/icons.js';
	
	export let entry;
	export let showCategory = true;
	
	$: colors = getCategoryColors(entry.category);
</script>

<div 
	class="relative overflow-hidden group transition-all duration-300 hover:scale-105 hover:opacity-95 rounded-lg"
	style="
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
		border-left: 3px solid {colors.border}80;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	"
>
	<!-- Subtle background gradient for category -->
	<div 
		class="absolute inset-0 opacity-5 group-hover:opacity-15 transition-opacity duration-300"
		style="background: linear-gradient(135deg, {colors.bg} 0%, transparent 50%, {colors.bg} 100%);"
	></div>
	
	<div class="p-4 relative z-10">
		<!-- Category Badge -->
		{#if showCategory}
			<div 
				class="inline-block px-2 py-1 rounded-lg text-xs mb-2 font-semibold"
				style="
					border: 1px solid rgba(201, 168, 118, 0.4); 
					color: rgba(201, 168, 118, 0.9); 
					background: rgba(201, 168, 118, 0.1);
				"
			>
				<Icon icon={getCategoryIcon(entry.category)} class="w-3 h-3 inline mr-1" style="color: {colors.primary};" />
				{getCategoryNameRussian(entry.category)}
			</div>
		{/if}
		
		<!-- Title -->
		<h3 style="color: #c9a876; font-family: 'Cinzel Decorative', serif; font-size: 1.125rem; margin-bottom: 1rem; text-shadow: 0 0 4px rgba(201, 168, 118, 0.3);">
			<a href="/{entry.category}/{entry.slug}" style="color: #c9a876; text-decoration: none; transition: color 0.3s ease;">
				{entry.title}
			</a>
		</h3>
		
		<!-- Metadata -->
		<div style="font-size: 0.875rem; color: rgba(243, 233, 210, 0.7); margin-bottom: 1rem;">
			{#if entry.faction}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('faction')} class="w-4 h-4" style="color: #E74C3C;" />
					<span style="color: #F1948A;">{entry.faction}</span>
				</div>
			{/if}
			
			{#if entry.type}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('type')} class="w-4 h-4" style="color: #5DADE2;" />
					<span style="color: #AED6F1;">{entry.type}</span>
				</div>
			{/if}
			
			{#if entry.status}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('status')} class="w-4 h-4" style="color: {entry.status === 'Alive' ? '#58D68D' : entry.status === 'Deceased' ? '#E74C3C' : '#AF7AC5'};" />
					<span style="color: {entry.status === 'Alive' ? '#A9DFBF' : entry.status === 'Deceased' ? '#F1948A' : '#D7BDE2'};">
						{entry.status}
					</span>
				</div>
			{/if}
			
			{#if entry.age}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('age')} class="w-4 h-4" style="color: #F39C12;" />
					<span style="color: #F8C471;">{entry.age} лет</span>
				</div>
			{/if}
			
			{#if entry.population}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('population')} class="w-4 h-4" style="color: #AF7AC5;" />
					<span style="color: #D7BDE2;">{entry.population}</span>
				</div>
			{/if}
		</div>
		
		<!-- Tags -->
		{#if entry.tags && entry.tags.length > 0}
			<div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
				{#each entry.tags.slice(0, 3) as tag}
					<span style="background: rgba(243, 233, 210, 0.1); color: rgba(243, 233, 210, 0.6); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
						{tag}
					</span>
				{/each}
				{#if entry.tags.length > 3}
					<span style="background: rgba(243, 233, 210, 0.1); color: rgba(243, 233, 210, 0.6); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem;">
						+{entry.tags.length - 3}
					</span>
				{/if}
			</div>
		{/if}
		
		<!-- Read More -->
		<div class="flex justify-end mt-3">
			<a 
				href="/{entry.category}/{entry.slug}" 
				class="inline-block px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg"
				style="
					background: linear-gradient(145deg, #5a4a3a 0%, #6b5b4b 100%);
					color: #d0d0d0;
					border: 1px solid rgba(201, 168, 118, 0.5);
					box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
					text-decoration: none;
				"
			>
				Читать далее →
			</a>
		</div>
	</div>
</div>