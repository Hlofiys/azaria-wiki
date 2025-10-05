<!-- Loading Animation Components -->
<script lang="ts">
	export let type: 'fade' | 'slide' | 'scale' | 'skeleton' = 'fade';
	export let delay: number = 0;
	export let duration: number = 500;
	export let show: boolean = true;
</script>

{#if type === 'skeleton'}
	<!-- Skeleton Loading for Cards -->
	<div class="border-azaria-gold/20 bg-azaria-bg/50 animate-pulse space-y-4 rounded-lg border p-4">
		<!-- Header skeleton -->
		<div class="flex items-center space-x-3">
			<div class="bg-azaria-gold/20 h-6 w-6 rounded"></div>
			<div class="bg-azaria-gold/20 h-4 w-24 rounded"></div>
		</div>

		<!-- Title skeleton -->
		<div class="bg-azaria-gold/30 h-6 w-3/4 rounded"></div>

		<!-- Content skeleton -->
		<div class="space-y-2">
			<div class="bg-azaria-gold/20 h-3 w-full rounded"></div>
			<div class="bg-azaria-gold/20 h-3 w-5/6 rounded"></div>
			<div class="bg-azaria-gold/20 h-3 w-4/6 rounded"></div>
		</div>

		<!-- Tags skeleton -->
		<div class="flex space-x-2">
			<div class="bg-azaria-gold/20 h-6 w-16 rounded-full"></div>
			<div class="bg-azaria-gold/20 h-6 w-20 rounded-full"></div>
			<div class="bg-azaria-gold/20 h-6 w-12 rounded-full"></div>
		</div>
	</div>
{:else}
	<!-- Animated Content Wrapper -->
	<div
		class="animate-content"
		class:animate-fade-in={type === 'fade' && show}
		class:animate-slide-up={type === 'slide' && show}
		class:animate-scale-in={type === 'scale' && show}
		style="
			animation-delay: {delay}ms;
			animation-duration: {duration}ms;
			animation-fill-mode: both;
		"
	>
		<slot />
	</div>
{/if}

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes scaleIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.animate-fade-in {
		animation: fadeIn ease-out;
	}

	.animate-slide-up {
		animation: slideUp ease-out;
	}

	.animate-scale-in {
		animation: scaleIn ease-out;
	}

	.animate-pulse {
		animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
	}

	/* Initial hidden state */
	.animate-content {
		opacity: 0;
	}

	/* Stagger animation delays for multiple items */
	.animate-content:nth-child(1) {
		animation-delay: 0ms;
	}
	.animate-content:nth-child(2) {
		animation-delay: 100ms;
	}
	.animate-content:nth-child(3) {
		animation-delay: 200ms;
	}
	.animate-content:nth-child(4) {
		animation-delay: 300ms;
	}
	.animate-content:nth-child(5) {
		animation-delay: 400ms;
	}
	.animate-content:nth-child(6) {
		animation-delay: 500ms;
	}
</style>
