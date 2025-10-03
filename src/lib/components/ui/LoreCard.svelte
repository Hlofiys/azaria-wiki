<script>
	export let entry;
	export let showCategory = true;
	
	// Get category icon
	function getCategoryIcon(category) {
		const icons = {
			characters: '👑',
			locations: '🏰',
			factions: '⚔️',
			artifacts: '✨',
			concepts: '🎯',
			creatures: '🐉'
		};
		return icons[category] || '📖';
	}
	
	// Get category color
	function getCategoryColor(category) {
		const colors = {
			characters: 'border-yellow-500',
			locations: 'border-blue-500',
			factions: 'border-red-500',
			artifacts: 'border-purple-500',
			concepts: 'border-green-500',
			creatures: 'border-orange-500'
		};
		return colors[category] || 'border-azaria-gold';
	}
</script>

<div class="azaria-card hover:opacity-90 transition-all duration-300 hover:scale-105" style="border-left: 4px solid {getCategoryColor(entry.category) === 'border-yellow-500' ? '#eab308' : getCategoryColor(entry.category) === 'border-blue-500' ? '#3b82f6' : getCategoryColor(entry.category) === 'border-red-500' ? '#ef4444' : getCategoryColor(entry.category) === 'border-purple-500' ? '#a855f7' : getCategoryColor(entry.category) === 'border-green-500' ? '#22c55e' : '#f97316'};">  
	<div style="padding: 1rem;">
		<!-- Category Badge -->
		{#if showCategory}
			<div style="display: inline-block; border: 1px solid #c9a876; color: #c9a876; padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; margin-bottom: 0.5rem;">
				{getCategoryIcon(entry.category)} {entry.category}
			</div>
		{/if}
		
		<!-- Title -->
		<h3 style="color: #c9a876; font-family: 'Cinzel Decorative', serif; font-size: 1.125rem; margin-bottom: 1rem;">
			<a href="/{entry.category}/{entry.slug}" style="color: #c9a876; text-decoration: none;">
				{entry.title}
			</a>
		</h3>
		
		<!-- Metadata -->
		<div style="font-size: 0.875rem; color: rgba(243, 233, 210, 0.7); margin-bottom: 1rem;">
			{#if entry.faction}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="color: #c9a876;">⚔️</span>
					<span>{entry.faction}</span>
				</div>
			{/if}
			
			{#if entry.type}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="color: #c9a876;">📋</span>
					<span>{entry.type}</span>
				</div>
			{/if}
			
			{#if entry.status}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="color: #c9a876;">💗</span>
					<span style="color: {entry.status === 'Alive' ? '#4ade80' : entry.status === 'Deceased' ? '#f87171' : 'inherit'};">
						{entry.status}
					</span>
				</div>
			{/if}
			
			{#if entry.age}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="color: #c9a876;">⏳</span>
					<span>{entry.age} лет</span>
				</div>
			{/if}
			
			{#if entry.population}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<span style="color: #c9a876;">👥</span>
					<span>{entry.population}</span>
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
		<div style="display: flex; justify-content: flex-end; margin-top: 0.75rem;">
			<a href="/{entry.category}/{entry.slug}" class="azaria-btn" style="font-size: 0.875rem; padding: 0.5rem 1rem;">
				Читать далее →
			</a>
		</div>
	</div>
</div>