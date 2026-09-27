<script lang="ts">
	import { Icon, getCategoryIcon } from '$lib/icons';
	import type { CategoryType } from '$lib/utils/categories';

	interface Props {
		title: string;
		category: CategoryType;
		image?: string;
		wide?: boolean;
		interactive?: boolean;
	}

	let { title, category, image = '', wide = false, interactive = false }: Props = $props();

	let broken = $state(false);
	const showImage = $derived(Boolean(image) && !broken);
	const initials = $derived(
		title
			.split(/\s+/)
			.slice(0, 2)
			.map((word) => word.charAt(0).toUpperCase())
			.join('')
	);
</script>

<div class="plate{wide ? ' plate--wide' : ''} seal" class:plate--interactive={interactive}>
	{#if showImage}
		<img
			src={image}
			{title}
			alt="Изображение: {title}"
			loading="lazy"
			decoding="async"
			onerror={() => (broken = true)}
		/>
	{:else}
		<div class="flex flex-col items-center gap-2 px-4 text-center">
			<Icon
				icon={getCategoryIcon(category)}
				width="34"
				class="opacity-70"
				style="color: var(--seal)"
			/>
			<span class="plate__letter">{initials}</span>
			<span class="eyebrow">{title}</span>
		</div>
	{/if}
</div>

<style>
	.plate :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.plate--interactive {
		cursor: zoom-in;
	}
</style>
