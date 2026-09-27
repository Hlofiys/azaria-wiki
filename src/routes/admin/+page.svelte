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
		<h1 class="mb-4 font-display text-3xl text-parchment">Перенаправление в CMS…</h1>
		<p class="text-parchment-dim">
			Если перенаправление не произошло автоматически,
			<a href={resolve('/admin/index.html' as `/${string}`)} class="text-brass underline"
				>нажмите здесь</a
			>
		</p>
	</div>
</div>
