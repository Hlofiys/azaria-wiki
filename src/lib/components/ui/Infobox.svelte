<script lang="ts">
	import { Icon, getCategoryIcon, getCategoryColors } from '$lib/icons';
	import { resolve } from '$app/paths';
	import type { EntryMetadata, EntryListItem } from '$lib/server/lore-parser';

	export let entry: EntryMetadata;
	export let backlinks: EntryListItem[] = [];

	$: colors = getCategoryColors(entry.category);
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

			<!-- Main Image (placeholder) -->
			{#if entry.image}
				<div
					class="bg-azaria-dark/50 border-azaria-gold/30 mb-3 flex h-32 w-full items-center justify-center rounded-lg border sm:h-40 md:mb-4 md:h-48"
				>
					<span class="text-azaria-text/50 text-xs sm:text-sm">Изображение скоро появится</span>
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
