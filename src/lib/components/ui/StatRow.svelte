<script lang="ts">
	interface Props {
		label: string;
		value: string;
	}

	let { label, value }: Props = $props();

	// Long values get their own line instead of a ragged right-aligned soup.
	const stacked = $derived(value.length > 34);
</script>

{#if stacked}
	<div class="flex flex-col gap-1">
		<span class="leader__label">{label}</span>
		<span class="text-[0.9375rem] leading-snug break-words text-parchment">{value}</span>
	</div>
{:else}
	<div class="leader">
		<span class="leader__label">{label}</span>
		<span class="leader__dots" aria-hidden="true"></span>
		<span class="leader__value">{value}</span>
	</div>
{/if}
