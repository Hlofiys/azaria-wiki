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

		window.addEventListener('scroll', updateScrollY);
		updateScrollY(); // Initial check

		return () => {
			window.removeEventListener('scroll', updateScrollY);
		};
	});

	function scrollToTop() {
		// Smooth scroll to the header
		const header = document.getElementById('main-header');
		if (header) {
			header.scrollIntoView({ behavior: 'smooth', block: 'start' });
		} else {
			// Fallback to top of page
			window.scrollTo({ top: 0, behavior: 'smooth' });
		}
	}
</script>

{#if showButton}
	<button
		onclick={scrollToTop}
		class="scroll-to-top-btn azaria-btn"
		title="Вернуться к заголовку"
		aria-label="Scroll to top"
	>
		<Icon icon="mdi:arrow-up" width="20" />
	</button>
{/if}

<style>
	.scroll-to-top-btn {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		z-index: 50;
		width: 3rem;
		height: 3rem;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		box-shadow:
			0 4px 12px rgba(0, 0, 0, 0.5),
			0 0 8px rgba(201, 168, 118, 0.3);
		transition: all 0.3s ease;
		animation: fadeInUp 0.3s ease-out;
	}

	.scroll-to-top-btn:hover {
		transform: translateY(-2px) scale(1.05);
		box-shadow:
			0 6px 16px rgba(0, 0, 0, 0.6),
			0 0 12px rgba(201, 168, 118, 0.5);
	}

	.scroll-to-top-btn:active {
		transform: translateY(0) scale(0.95);
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Mobile adjustments */
	@media (max-width: 768px) {
		.scroll-to-top-btn {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 2.75rem;
			height: 2.75rem;
		}
	}

	@media (max-width: 480px) {
		.scroll-to-top-btn {
			bottom: 1rem;
			right: 1rem;
			width: 2.5rem;
			height: 2.5rem;
		}
	}
</style>
