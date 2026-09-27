<script lang="ts">
	import { Icon, getCategoryIcon, getCategoryName } from '$lib/icons';
	import { entryFolio } from '$lib/utils/categories';
	import { resolve } from '$app/paths';
	import { imageViewer } from '$lib/stores/imageViewerStore';
	import StatRow from './StatRow.svelte';
	import Stamp from './Stamp.svelte';
	import Tag from './Tag.svelte';
	import EntryPlate from './EntryPlate.svelte';
	import type { EntryMetadata, EntryListItem } from '$lib/server/lore-parser';

	interface Props {
		entry: EntryMetadata;
		backlinks?: EntryListItem[];
	}

	let { entry, backlinks = [] }: Props = $props();

	const FIELDS: Array<{ key: keyof EntryMetadata; label: string }> = [
		{ key: 'type', label: 'Тип' },
		{ key: 'status', label: 'Статус' },
		{ key: 'faction', label: 'Фракция' },
		{ key: 'owner', label: 'Владелец' },
		{ key: 'ruler', label: 'Правитель' },
		{ key: 'realm', label: 'Регион' },
		{ key: 'creator', label: 'Создатель' },
		{ key: 'era', label: 'Эпоха' },
		{ key: 'age', label: 'Возраст' },
		{ key: 'population', label: 'Население' },
		{ key: 'length', label: 'Протяжённость' },
		{ key: 'effect', label: 'Эффект' },
		{ key: 'feature', label: 'Особенность' },
		{ key: 'members', label: 'Состав' },
		{ key: 'philosophy', label: 'Философия' },
		{ key: 'specialization', label: 'Специализация' },
		{ key: 'access', label: 'Доступ' },
		{ key: 'nickname', label: 'Прозвище' },
		{ key: 'description', label: 'Описание' }
	];

	const rows = $derived(
		FIELDS.map(({ key, label }) => {
			const raw = entry[key];
			if (raw === undefined || raw === null || raw === '') return null;
			let value = String(raw);
			if (key === 'age' && /^\d+$/.test(value)) value = `${value} лет`;
			return { key, label, value };
		}).filter(
			(row): row is { key: keyof EntryMetadata; label: string; value: string } => row !== null
		)
	);

	const status = $derived(typeof entry.status === 'string' ? entry.status : '');
	const isShortStatus = $derived(status.length > 0 && status.length <= 26 && !status.includes('—'));
	const folio = $derived(entryFolio(entry.category, entry.slug));

	function openImage() {
		if (entry.image) imageViewer.open(entry.image);
	}
</script>

<aside class="seal sticky top-24" data-seal={entry.category}>
	<div class="frame">
		<div class="relative z-10 p-5">
			<!-- Dossier header -->
			<div class="mb-4 flex items-baseline justify-between gap-3">
				<p class="eyebrow">Досье</p>
				<p class="folio">{folio}</p>
			</div>

			<div class="mb-4 flex items-center gap-2">
				<Icon icon={getCategoryIcon(entry.category)} width="18" style="color: var(--seal)" />
				<span class="text-sm font-semibold" style="color: var(--seal)"
					>{getCategoryName(entry.category)}</span
				>
				{#if isShortStatus}
					<span class="ml-auto"><Stamp label={status} /></span>
				{/if}
			</div>

			{#if entry.image}
				<button
					type="button"
					class="mb-4 block w-full cursor-zoom-in p-0"
					onclick={openImage}
					aria-label="Открыть изображение в полном размере"
				>
					<EntryPlate title={entry.title} category={entry.category} image={entry.image} wide />
				</button>
			{/if}

			<!-- Ruled ledger rows -->
			<div class="flex flex-col gap-2.5">
				{#each rows as row (row.key)}
					<StatRow label={row.label} value={row.value} />
				{/each}
			</div>

			{#if entry.tags && entry.tags.length > 0}
				<div class="mt-5 border-t border-line pt-4">
					<p class="eyebrow mb-2.5">Метки</p>
					<div class="flex flex-wrap gap-1.5">
						{#each entry.tags as tag (tag)}
							<Tag label={tag} />
						{/each}
					</div>
				</div>
			{/if}

			{#if backlinks.length > 0}
				<div class="mt-5 border-t border-line pt-4">
					<p class="eyebrow mb-2.5">Упоминается в</p>
					<ul class="flex flex-col gap-1.5">
						{#each backlinks.slice(0, 6) as backlink (backlink.slug)}
							<li>
								<a
									href={resolve(`/${backlink.category}/${backlink.slug}` as `/${string}/${string}`)}
									class="flex items-baseline gap-2 text-sm text-parchment-dim hover:text-brass-bright"
								>
									<span class="text-brass-deep">•</span>
									<span>{backlink.title}</span>
								</a>
							</li>
						{/each}
					</ul>
					{#if backlinks.length > 6}
						<p class="folio mt-2">и ещё {backlinks.length - 6}</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</aside>
