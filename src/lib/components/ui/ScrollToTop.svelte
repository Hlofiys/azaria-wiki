<script lang="ts">
	import { onMount } from 'svelte';
	import Icon from '@iconify/svelte';

	let showButton = $state(false);
	let scrollY = $state(0);

	onMount(() => {
		const updateScrollY = () => {
			scrollY = window.scrollY;
			// Show button when user has scrolled down more than 300px
			showButton = scrollY > 300;
		};

		window.addEventListener('scroll', updateScrollY, { passive: true });
		updateScrollY(); // Initial check

		return () => {
			window.removeEventListener('scroll', updateScrollY);
		};
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#if showButton}
	<button
		onclick={scrollToTop}
		class="icon-btn fixed right-5 bottom-5 z-30 size-11 bg-ink-850 shadow-[var(--shadow-lift)]"
		title="Наверх"
		aria-label="Наверх"
	>
		<Icon icon="mdi:arrow-up" width="20" />
	</button>
{/if}
