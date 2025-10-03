<script>
	import { onMount } from 'svelte';
	
	onMount(() => {
		// Redirect to the CMS
		window.location.href = '/admin/index.html';
	});
</script>

<svelte:head>
	<title>Азария CMS — Админ панель</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center">
	<div class="text-center">
		<h1 class="text-3xl font-heading text-azaria-gold mb-4">
			Перенаправление в CMS...
		</h1>
		<p class="text-azaria-text">
			Если перенаправление не произошло автоматически, 
			<a href="/admin/index.html" class="text-azaria-gold underline">нажмите здесь</a>
		</p>
	</div>
</div>