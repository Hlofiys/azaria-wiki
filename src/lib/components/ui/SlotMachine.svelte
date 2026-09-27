<script lang="ts">
	import { Icon, getCategoryIcon, getUIIcon } from '$lib/icons';
	import { resolve } from '$app/paths';
	import LoreCard from './LoreCard.svelte';
	import type { EntryListItem } from '$lib/server/lore-parser';

	interface Props {
		entries: EntryListItem[];
		reducedMotion?: boolean;
		total?: number;
	}

	let { entries, reducedMotion = false, total = 0 }: Props = $props();

	const ROW = 48;
	const VISIBLE_ROWS = 3;
	const STRIP_LENGTH = 18;
	/** Winner sits in the middle row with a record below it, like a real machine. */
	const WINNER_INDEX = STRIP_LENGTH - 2;
	const START_Y = ROW;
	const END_Y = ROW * (1 - WINNER_INDEX);
	const SPIN_MS = [1150, 1400, 1650];

	let spinning = $state(false);
	let settled = $state(false);
	let results = $state<EntryListItem[]>([]);
	let strips = $state<EntryListItem[][]>([[], [], []]);
	let offset = $state(START_Y);
	let phase = $state<'idle' | 'spin'>('idle');

	const pool = $derived(entries.slice(0, 60));

	// Load the reels with sample records so the cabinet looks stocked before the first pull.
	$effect(() => {
		if (pool.length > 0 && strips[0].length === 0) {
			strips = [0, 1, 2].map(() => shuffle(pool).slice(0, STRIP_LENGTH)) as EntryListItem[][];
		}
	});

	function shuffle<T>(input: T[]): T[] {
		const copy = [...input];
		for (let i = copy.length - 1; i > 0; i -= 1) {
			const j = Math.floor(Math.random() * (i + 1));
			[copy[i], copy[j]] = [copy[j], copy[i]];
		}
		return copy;
	}

	function spin() {
		if (spinning || pool.length === 0) return;

		spinning = true;
		settled = false;
		results = [];
		phase = 'idle';
		offset = START_Y;

		const winners = shuffle(pool).slice(0, VISIBLE_ROWS);
		strips = winners.map((winner) => [
			...shuffle(pool.filter((item) => item.slug !== winner.slug)).slice(0, WINNER_INDEX),
			winner,
			...shuffle(pool.filter((item) => item.slug !== winner.slug)).slice(
				0,
				STRIP_LENGTH - WINNER_INDEX - 1
			)
		]);

		const finish = () => {
			results = winners;
			spinning = false;
			settled = true;
		};

		if (reducedMotion) {
			offset = END_Y;
			window.setTimeout(finish, 80);
			return;
		}

		// Next frame: apply the end offset so the CSS transition animates it.
		requestAnimationFrame(() =>
			requestAnimationFrame(() => {
				phase = 'spin';
				offset = END_Y;
			})
		);
		window.setTimeout(finish, SPIN_MS[VISIBLE_ROWS - 1] + 120);
	}
</script>

<div id="slot-machine" class="frame seal scroll-mt-24">
	<div class="relative z-10 p-5 sm:p-7">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<div>
				<p class="eyebrow">Стол судьбы</p>
				<h2 class="mt-1 font-display text-2xl sm:text-3xl">Слот-машина Судьбы</h2>
			</div>
			<p class="folio">ставка · 1 бонуска</p>
		</div>

		<p class="mt-3 max-w-xl text-sm text-parchment-dim">
			Позвольте случайности выбрать ваше следующее приключение в мире Азарии.
		</p>

		<div class="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-end">
			<!-- Cabinet -->
			<div
				class="grid flex-1 grid-cols-3 gap-2 rounded-ledger border border-line bg-ink-900/70 p-2 sm:gap-3 sm:p-3"
				aria-busy={spinning}
			>
				{#each [0, 1, 2] as reel (reel)}
					<div
						class="relative overflow-hidden rounded-[2px] border border-line bg-ink-850"
						style="height: {ROW *
							VISIBLE_ROWS}px; mask-image: linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent); -webkit-mask-image: linear-gradient(to bottom, transparent, #000 26%, #000 74%, transparent);"
					>
						<div
							style="transform: translateY({offset}px); transition: transform {phase === 'spin'
								? SPIN_MS[reel]
								: 0}ms cubic-bezier(0.12, 0.78, 0.16, 1); will-change: transform;"
						>
							{#each strips[reel] as item, index (index)}
								<div
									class="flex items-center gap-2 border-b border-line/40 px-2"
									style="height: {ROW}px"
									data-seal={item.category}
								>
									<Icon
										icon={getCategoryIcon(item.category)}
										width="13"
										class="seal-text shrink-0"
									/>
									<span class="truncate text-xs text-parchment-dim">{item.title}</span>
								</div>
							{:else}
								<div class="grid place-items-center" style="height: {ROW * VISIBLE_ROWS}px">
									<Icon icon={getUIIcon('question')} width="22" class="text-parchment-mute" />
								</div>
							{/each}
						</div>
					</div>
				{/each}
			</div>

			<!-- Lever -->
			<div class="flex shrink-0 flex-col items-center gap-3">
				<button
					type="button"
					class="btn btn--solid h-12 w-full sm:h-[4.5rem] sm:w-[4.5rem] sm:flex-col sm:gap-1.5 sm:p-0"
					onclick={spin}
					disabled={spinning}
				>
					<Icon
						icon={spinning ? getUIIcon('loading') : getUIIcon('slot')}
						width="18"
						class={spinning ? 'animate-spin' : ''}
					/>
					<span class="sm:hidden">{spinning ? 'Крутится…' : 'Спинануть судьбу!'}</span>
				</button>
				<span class="folio hidden sm:block">тяни</span>
			</div>
		</div>

		<div aria-live="polite">
			{#if settled && results.length > 0}
				<div class="mt-7">
					<p class="rule-ornament mb-4 text-xs" aria-hidden="true">❖</p>
					<p class="eyebrow mb-4 text-center">Судьба выбрала для вас</p>
					<div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
						{#each results as entry (entry.slug)}
							<LoreCard {entry} showCategory />
						{/each}
					</div>
					<div class="mt-4 flex justify-center">
						<a
							href={resolve(`/${results[0].category}/${results[0].slug}` as `/${string}/${string}`)}
							class="btn"
						>
							Перейти к первой записи
							<Icon icon={getUIIcon('arrow-right')} width="14" />
						</a>
					</div>
				</div>
			{:else if !spinning}
				<p class="mt-4 text-center text-xs text-parchment-mute">
					Три реели, шесть разделов, {total} записей — и ни одной гарантии.
				</p>
			{/if}
		</div>
	</div>
</div>
