<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	onMount(() => {
		// Redirect to the CMS
		window.location.href = '/admin/index.html';
	});
</script>

<svelte:head>
	<title>Азария CMS — Админ панель</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="font-heading text-azaria-gold mb-4 text-3xl">Перенаправление в CMS...</h1>
		<p class="text-azaria-text">
			Если перенаправление не произошло автоматически,
			<a href={resolve('/admin/index.html' as `/${string}`)} class="text-azaria-gold underline"
				>нажмите здесь</a
			>
		</p>
	</div>
</div>
