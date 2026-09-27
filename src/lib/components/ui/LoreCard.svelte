<script lang="ts">
	import { Icon, getCategoryIcon, getCategoryName, getUIIcon } from '$lib/icons';
	import { entryFolio } from '$lib/utils/categories';
	import { resolve } from '$app/paths';
	import Tag from './Tag.svelte';
	import Stamp from './Stamp.svelte';
	import type { EntryListItem } from '$lib/server/lore-parser';

	interface Props {
		entry: EntryListItem;
		showCategory?: boolean;
		variant?: 'grid' | 'ledger';
	}

	let { entry, showCategory = true, variant = 'grid' }: Props = $props();

	const href = $derived(resolve(`/${entry.category}/${entry.slug}` as `/${string}/${string}`));
	const folio = $derived(entryFolio(entry.category, entry.slug));
	const status = $derived(typeof entry.status === 'string' ? entry.status : '');
	const isShortStatus = $derived(status.length > 0 && status.length <= 22 && !status.includes('—'));
	const secondary = $derived(
		typeof entry.type === 'string' && entry.type.length > 0
			? entry.type
			: typeof entry.faction === 'string'
				? entry.faction
				: ''
	);
	const tags = $derived(entry.tags ?? []);
</script>

{#if variant === 'ledger'}
	<a
		{href}
		data-seal={entry.category}
		class="seal group grid grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-1 border-b border-line px-3 py-3 transition-colors hover:bg-ink-700/40 @4xl:grid-cols-[5.5rem_minmax(0,1fr)_13rem_13rem_1.25rem]"
	>
		<span class="folio hidden @4xl:block">{folio}</span>
		<span
			class="font-display text-[1.0625rem] leading-snug text-parchment group-hover:text-brass-bright"
			>{entry.title}</span
		>
		<span class="text-sm text-parchment-dim @4xl:text-[0.8125rem]">{secondary}</span>
		<span class="col-span-2 flex flex-wrap gap-1.5 @4xl:col-span-1">
			{#each tags.slice(0, 2) as tag (tag)}
				<Tag label={tag} />
			{/each}
			{#if tags.length > 2}
				<span class="folio self-center">+{tags.length - 2}</span>
			{/if}
		</span>
		<Icon
			icon={getUIIcon('arrow-right')}
			width="14"
			class="hidden self-center text-brass-deep transition-transform group-hover:translate-x-0.5 group-hover:text-brass @4xl:block"
		/>
	</a>
{:else}
	<a
		{href}
		data-seal={entry.category}
		class="seal frame frame--link group flex h-full flex-col"
		aria-label={entry.title}
	>
		<div class="relative z-10 flex h-full flex-col p-4">
			<div class="flex items-center justify-between gap-3">
				{#if showCategory}
					<span class="chip chip--brass">
						<Icon icon={getCategoryIcon(entry.category)} width="12" style="color: var(--seal)" />
						{getCategoryName(entry.category)}
					</span>
					<span class="folio">{folio}</span>
				{:else}
					<span class="chip">
						<Icon icon={getCategoryIcon(entry.category)} width="12" style="color: var(--seal)" />
						{folio}
					</span>
				{/if}
			</div>

			<h3
				class="mt-3 font-display text-lg leading-snug text-parchment group-hover:text-brass-bright"
			>
				{entry.title}
			</h3>

			{#if secondary}
				<p class="mt-1.5 line-clamp-2 text-sm text-parchment-dim">{secondary}</p>
			{/if}

			{#if tags.length > 0}
				<div class="mt-3 flex flex-wrap gap-1.5">
					{#each tags.slice(0, 3) as tag (tag)}
						<Tag label={tag} />
					{/each}
					{#if tags.length > 3}
						<span class="folio self-center">+{tags.length - 3}</span>
					{/if}
				</div>
			{/if}

			<div class="mt-auto flex items-end justify-between gap-3 pt-4">
				{#if isShortStatus}
					<Stamp label={status} />
				{:else}
					<span></span>
				{/if}
				<span class="eyebrow flex items-center gap-1.5 transition-colors group-hover:text-brass">
					Читать
					<Icon
						icon={getUIIcon('arrow-right')}
						width="13"
						class="transition-transform group-hover:translate-x-0.5"
					/>
				</span>
			</div>
		</div>
	</a>
{/if}
