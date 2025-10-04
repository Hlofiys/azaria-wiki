<script lang="ts">
	import {
		Icon,
		getCategoryIcon,
		getUIIcon,
		getCategoryColors,
		getCategoryNameRussian
	} from '$lib/icons';
	import { resolve } from '$app/paths';
	import type { EntryListItem } from '$lib/server/lore-parser';

	export let entry: EntryListItem;
	export let showCategory: boolean = true;

	$: colors = getCategoryColors(entry.category);
</script>

<div
	class="group relative overflow-hidden rounded-lg transition-all duration-300 hover:scale-105 hover:opacity-95"
	style="
		background: linear-gradient(145deg, #242424 0%, #2a2a2a 100%);
		border: 1px solid rgba(201, 168, 118, 0.3);
		border-left: 3px solid {colors.border}80;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
	"
>
	<!-- Subtle background gradient for category -->
	<div
		class="absolute inset-0 opacity-5 transition-opacity duration-300 group-hover:opacity-15"
		style="background: linear-gradient(135deg, {colors.bg} 0%, transparent 50%, {colors.bg} 100%);"
	></div>

	<div class="relative z-10 p-3 sm:p-4">
		<!-- Category Badge -->
		{#if showCategory}
			<div
				class="mb-2 inline-block rounded-lg px-2 py-1 text-xs font-semibold"
				style="
					border: 1px solid rgba(201, 168, 118, 0.4);
					color: rgba(201, 168, 118, 0.9);
					background: rgba(201, 168, 118, 0.1);
				"
			>
				<Icon
					icon={getCategoryIcon(entry.category)}
					class="mr-1 inline h-3 w-3"
					style="color: {colors.primary};"
				/>
				{getCategoryNameRussian(entry.category)}
			</div>
		{/if}

		<!-- Title -->
		<h3
			style="color: #c9a876; font-family: 'Cinzel Decorative', serif; font-size: 1rem; margin-bottom: 0.75rem; text-shadow: 0 0 4px rgba(201, 168, 118, 0.3);"
			class="sm:mb-4 sm:text-lg"
		>
			<a
				href={resolve(`/${entry.category}/${entry.slug}` as `/${string}/${string}`)}
				style="color: #c9a876; text-decoration: none; transition: color 0.3s ease;"
			>
				{entry.title}
			</a>
		</h3>

		<!-- Metadata -->
		<div
			style="font-size: 0.75rem; color: rgba(243, 233, 210, 0.7); margin-bottom: 0.75rem;"
			class="sm:mb-4 sm:text-sm"
		>
			{#if entry.faction}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('faction')} class="h-3 w-3 sm:h-4 sm:w-4" style="color: #E74C3C;" />
					<span style="color: #F1948A; word-break: break-word;">{entry.faction}</span>
				</div>
			{/if}

			{#if entry.type}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('type')} class="h-3 w-3 sm:h-4 sm:w-4" style="color: #5DADE2;" />
					<span style="color: #AED6F1; word-break: break-word;">{entry.type}</span>
				</div>
			{/if}

			{#if entry.status}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon
						icon={getUIIcon('status')}
						class="h-3 w-3 sm:h-4 sm:w-4"
						style="color: {entry.status === 'Alive'
							? '#58D68D'
							: entry.status === 'Deceased'
								? '#E74C3C'
								: '#AF7AC5'};"
					/>
					<span
						style="color: {entry.status === 'Alive'
							? '#A9DFBF'
							: entry.status === 'Deceased'
								? '#F1948A'
								: '#D7BDE2'};"
					>
						{entry.status}
					</span>
				</div>
			{/if}

			{#if entry.age}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon icon={getUIIcon('age')} class="h-3 w-3 sm:h-4 sm:w-4" style="color: #F39C12;" />
					<span style="color: #F8C471;">{entry.age} лет</span>
				</div>
			{/if}

			{#if entry.population}
				<div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
					<Icon
						icon={getUIIcon('population')}
						class="h-3 w-3 sm:h-4 sm:w-4"
						style="color: #AF7AC5;"
					/>
					<span style="color: #D7BDE2;">{entry.population}</span>
				</div>
			{/if}
		</div>

		<!-- Tags -->
		{#if entry.tags && entry.tags.length > 0}
			<div style="display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.5rem;">
				{#each entry.tags.slice(0, 3) as tag (tag)}
					<span
						style="background: rgba(243, 233, 210, 0.1); color: rgba(243, 233, 210, 0.6); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem;"
						class="sm:text-xs"
					>
						{tag}
					</span>
				{/each}
				{#if entry.tags.length > 3}
					<span
						style="background: rgba(243, 233, 210, 0.1); color: rgba(243, 233, 210, 0.6); padding: 0.125rem 0.5rem; border-radius: 0.25rem; font-size: 0.625rem;"
						class="sm:text-xs"
					>
						+{entry.tags.length - 3}
					</span>
				{/if}
			</div>
		{/if}

		<!-- Read More -->
		<div class="mt-3 flex justify-end">
			<a
				href={resolve(`/${entry.category}/${entry.slug}` as `/${string}/${string}`)}
				class="azaria-btn text-xs sm:text-sm"
				style="padding: 0.375rem 0.75rem; font-size: 0.75rem;"
			>
				Читать далее →
			</a>
		</div>
	</div>
</div>
