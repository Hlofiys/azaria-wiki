<script lang="ts">
	interface Props {
		label: string;
		tone?: 'default' | 'brass';
		title?: string;
	}

	let { label, tone = 'default', title = '' }: Props = $props();

	const className = $derived(`chip${tone === 'brass' ? ' chip--brass' : ''}`);
</script>

<span class={className} {title}>{label}</span>
