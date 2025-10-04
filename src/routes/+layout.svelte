<script lang="ts">
	import '../app.css';
	import Header from '$lib/components/layout/Header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href="/favicon.ico" sizes="any" />
	<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
	<link rel="apple-touch-icon" href="/favicon.svg" />
</svelte:head>

<div style="min-height: 100vh; background-color: #1a1a1a;">
	<Header />

	<main class="container mx-auto px-4 py-8">
		{@render children?.()}
	</main>

	<footer class="azaria-card border-t-2" style="border-top-color: #c9a876; margin-top: 4rem;">
		<div class="container mx-auto px-4 py-8 text-center">
			<p style="color: rgba(208, 208, 208, 0.7); font-family: 'Lora', serif;">
				Вики мира Азарии — Медивал-деп-панк вселенная
			</p>
			<p
				style="color: rgba(208, 208, 208, 0.5); font-family: 'Lora', serif; font-size: 0.875rem; margin-top: 0.5rem;"
			>
				Создано с помощью SvelteKit и магии удачи
			</p>
		</div>
	</footer>
</div>
