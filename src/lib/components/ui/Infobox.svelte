<script>
	export let entry;
	export let backlinks = [];
	
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
</script>

<div class="sticky top-4">
	<div class="card bg-azaria-content border-2 border-azaria-gold/50 ornate-border">
		<div class="card-body">
			<!-- Title with Icon -->
			<h2 class="card-title text-azaria-gold font-heading text-xl mb-4">
				{getCategoryIcon(entry.category)} {entry.title}
			</h2>
			
			<!-- Main Image (placeholder) -->
			{#if entry.image}
				<div class="w-full h-48 bg-azaria-dark/50 rounded-lg border border-azaria-gold/30 flex items-center justify-center mb-4">
					<span class="text-azaria-text/50 text-sm">Изображение скоро появится</span>
				</div>
			{/if}
			
			<!-- Information Table -->
			<div class="overflow-x-auto">
				<table class="table table-compact w-full text-sm">
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
									<span class:text-green-400={entry.status === 'Alive'} class:text-red-400={entry.status === 'Deceased'}>
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
				<div class="mt-4">
					<h4 class="text-azaria-gold font-semibold mb-2">Теги</h4>
					<div class="flex flex-wrap gap-1">
						{#each entry.tags as tag}
							<span class="badge badge-outline border-azaria-gold/50 text-azaria-text text-xs">
								{tag}
							</span>
						{/each}
					</div>
				</div>
			{/if}
			
			<!-- Referenced In (Backlinks) -->
			{#if backlinks && backlinks.length > 0}
				<div class="mt-4">
					<h4 class="text-azaria-gold font-semibold mb-2">Упоминается в</h4>
					<div class="space-y-1">
						{#each backlinks.slice(0, 5) as backlink}
							<a href="/{backlink.category}/{backlink.slug}" class="block text-sm text-azaria-text hover:text-azaria-gold transition-colors">
								• {backlink.title}
							</a>
						{/each}
						{#if backlinks.length > 5}
							<p class="text-xs text-azaria-text/50">
								И еще {backlinks.length - 5} статей...
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>