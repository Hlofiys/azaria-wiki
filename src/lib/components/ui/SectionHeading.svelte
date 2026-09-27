<script lang="ts">
	import { Icon } from '$lib/icons';

	interface Props {
		title: string;
		eyebrow?: string;
		icon?: string;
		level?: 1 | 2;
		align?: 'left' | 'center';
		id?: string;
	}

	let { title, eyebrow = '', icon = '', level = 2, align = 'left', id = '' }: Props = $props();

	const centered = $derived(align === 'center');
</script>

<header class="flex flex-col gap-2" class:items-center={centered} class:text-center={centered}>
	{#if eyebrow}
		<p class="eyebrow">{eyebrow}</p>
	{/if}

	{#if level === 1}
		<h1 {id} class="text-3xl sm:text-4xl lg:text-5xl">{title}</h1>
	{:else}
		<h2 {id} class="text-2xl sm:text-3xl">
			{#if icon}
				<Icon {icon} width="22" class="mr-2 inline align-[-3px] text-brass" />
			{/if}
			{title}
		</h2>
	{/if}

	{#if centered}
		<span class="rule-ornament w-40 text-xs" aria-hidden="true">❖</span>
	{:else}
		<span class="block h-px w-full bg-[linear-gradient(90deg,var(--color-line-strong),transparent)]"
		></span>
	{/if}
</header>
