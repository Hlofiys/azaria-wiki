<script lang="ts">
	interface Props {
		label: string;
		tone?: 'seal' | 'lost' | 'ok';
	}

	let { label, tone = 'seal' }: Props = $props();

	const toneClass = $derived(tone === 'lost' ? ' stamp--lost' : tone === 'ok' ? ' stamp--ok' : '');
</script>

<span class="stamp{toneClass}">{label}</span>
