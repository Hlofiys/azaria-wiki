<!-- Performance Dashboard -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { RealUserMonitoring } from '$lib/optimizations/performance-monitor.js';
	import { AdvancedLazyLoader } from '$lib/utils/lazy-loader.js';
	import { RoutePreloader } from '$lib/utils/route-preloader.js';
	import { ServiceWorkerCacheManager } from '$lib/optimizations/service-worker-cache.js';

	let performanceData = $state<any>({});
	let lazyLoaderStats = $state<any>({});
	let routePreloaderStats = $state<any>({});
	let cacheStats = $state<any>({});
	let isLoading = $state(true);

	onMount(async () => {
		if (browser) {
			await loadPerformanceData();
			
			// Refresh data every 30 seconds
			const interval = setInterval(loadPerformanceData, 30000);
			return () => clearInterval(interval);
		}
	});

	async function loadPerformanceData() {
		try {
			const rum = RealUserMonitoring.getInstance();
			const lazyLoader = AdvancedLazyLoader.getInstance();
			const routePreloader = RoutePreloader.getInstance();
			const swCache = ServiceWorkerCacheManager.getInstance();

			performanceData = rum.generateReport();
			lazyLoaderStats = lazyLoader.getStats();
			routePreloaderStats = routePreloader.getAnalytics();
			cacheStats = await swCache.getCacheStats();
			
			isLoading = false;
		} catch (error) {
			console.error('Failed to load performance data:', error);
			isLoading = false;
		}
	}

	function getScoreColor(score: number): string {
		if (score >= 90) return '#10B981'; // Green
		if (score >= 70) return '#F59E0B'; // Yellow
		return '#EF4444'; // Red
	}

	function getRatingColor(rating: string): string {
		switch (rating) {
			case 'good': return '#10B981';
			case 'needs-improvement': return '#F59E0B';
			case 'poor': return '#EF4444';
			default: return '#6B7280';
		}
	}
</script>

<svelte:head>
	<title>Performance Dashboard - Azaria Wiki Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white p-6">
	<div class="max-w-7xl mx-auto">
		<h1 class="text-4xl font-bold mb-8 text-center">
			<span class="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
				Performance Dashboard
			</span>
		</h1>

		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
				<span class="ml-4 text-lg">Loading performance data...</span>
			</div>
		{:else}
			<!-- Performance Score -->
			<div class="mb-8">
				<div class="bg-gray-800 rounded-lg p-6 text-center">
					<h2 class="text-2xl font-bold mb-4">Overall Performance Score</h2>
					<div class="relative w-32 h-32 mx-auto">
						<svg class="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
							<path
								d="M18 2.0845
								a 15.9155 15.9155 0 0 1 0 31.831
								a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke="#374151"
								stroke-width="3"
							/>
							<path
								d="M18 2.0845
								a 15.9155 15.9155 0 0 1 0 31.831
								a 15.9155 15.9155 0 0 1 0 -31.831"
								fill="none"
								stroke={getScoreColor(performanceData.performanceScore || 0)}
								stroke-width="3"
								stroke-dasharray="{(performanceData.performanceScore || 0)}, 100"
							/>
						</svg>
						<div class="absolute inset-0 flex items-center justify-center">
							<span class="text-2xl font-bold">{performanceData.performanceScore || 0}</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Core Web Vitals -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{#each Object.entries(performanceData.coreWebVitals || {}) as [name, vital]}
					<div class="bg-gray-800 rounded-lg p-6">
						<h3 class="text-lg font-semibold mb-2">{name}</h3>
						<div class="text-2xl font-bold mb-2" style="color: {getRatingColor(vital.rating)}">
							{vital.value?.toFixed(2)}
							{name === 'CLS' ? '' : 'ms'}
						</div>
						<div class="text-sm text-gray-400 capitalize">
							{vital.rating?.replace('-', ' ')}
						</div>
					</div>
				{/each}
			</div>

			<!-- Lazy Loading Stats -->
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
				<div class="bg-gray-800 rounded-lg p-6">
					<h3 class="text-xl font-semibold mb-4">Lazy Loading Performance</h3>
					<div class="space-y-4">
						<div class="flex justify-between">
							<span>Observed Elements:</span>
							<span class="font-bold">{lazyLoaderStats.pendingCallbacks || 0}</span>
						</div>
						<div class="flex justify-between">
							<span>Loaded Elements:</span>
							<span class="font-bold">{lazyLoaderStats.loadedElements || 0}</span>
						</div>
						<div class="flex justify-between">
							<span>Active Observers:</span>
							<span class="font-bold">{lazyLoaderStats.observersCount || 0}</span>
						</div>
						<div class="flex justify-between">
							<span>Browser Support:</span>
							<span class="font-bold" style="color: {lazyLoaderStats.isSupported ? '#10B981' : '#EF4444'}">
								{lazyLoaderStats.isSupported ? 'Yes' : 'No'}
							</span>
						</div>
					</div>
				</div>

				<div class="bg-gray-800 rounded-lg p-6">
					<h3 class="text-xl font-semibold mb-4">Route Preloader Analytics</h3>
					<div class="space-y-4">
						<div class="flex justify-between">
							<span>Preloaded Routes:</span>
							<span class="font-bold">{routePreloaderStats.preloadedRoutes?.length || 0}</span>
						</div>
						<div class="flex justify-between">
							<span>Visited Routes:</span>
							<span class="font-bold">{routePreloaderStats.visitedRoutes?.length || 0}</span>
						</div>
						<div class="flex justify-between">
							<span>Preload Hit Rate:</span>
							<span class="font-bold" style="color: {(routePreloaderStats.preloadHitRate || 0) > 0.7 ? '#10B981' : '#F59E0B'}">
								{((routePreloaderStats.preloadHitRate || 0) * 100).toFixed(1)}%
							</span>
						</div>
						<div class="flex justify-between">
							<span>Avg Dwell Time:</span>
							<span class="font-bold">{(routePreloaderStats.averageDwellTime || 0).toFixed(0)}ms</span>
						</div>
					</div>
				</div>
			</div>

			<!-- Cache Statistics -->
			<div class="bg-gray-800 rounded-lg p-6 mb-8">
				<h3 class="text-xl font-semibold mb-4">Service Worker Cache Status</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
					{#each Object.entries(cacheStats) as [cacheName, stats]}
						<div class="bg-gray-700 rounded-lg p-4">
							<h4 class="font-semibold mb-2">{cacheName}</h4>
							<div class="text-sm text-gray-300">
								<div>Entries: {stats.entries}</div>
								<div class="mt-2 text-xs text-gray-400 max-h-20 overflow-y-auto">
									{#each stats.requests.slice(0, 3) as request}
										<div>{request.split('/').pop()}</div>
									{/each}
									{#if stats.requests.length > 3}
										<div>+{stats.requests.length - 3} more...</div>
									{/if}
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Recommendations -->
			{#if performanceData.recommendations?.length > 0}
				<div class="bg-gray-800 rounded-lg p-6 mb-8">
					<h3 class="text-xl font-semibold mb-4">Performance Recommendations</h3>
					<div class="space-y-3">
						{#each performanceData.recommendations as recommendation}
							<div class="flex items-start gap-3 p-3 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
								<div class="text-yellow-400 mt-1">⚠️</div>
								<div class="text-sm">{recommendation}</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Recent Metrics -->
			<div class="bg-gray-800 rounded-lg p-6">
				<h3 class="text-xl font-semibold mb-4">System Status</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					<div class="text-center">
						<div class="text-2xl font-bold text-green-400">{performanceData.totalMetrics || 0}</div>
						<div class="text-sm text-gray-400">Total Metrics</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-blue-400">{performanceData.last24hMetrics || 0}</div>
						<div class="text-sm text-gray-400">Last 24h</div>
					</div>
					<div class="text-center">
						<div class="text-2xl font-bold text-purple-400">
							{new Date(performanceData.timestamp).toLocaleTimeString()}
						</div>
						<div class="text-sm text-gray-400">Last Updated</div>
					</div>
					<div class="text-center">
						<button 
							onclick={loadPerformanceData}
							class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
						>
							Refresh Data
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	:global(body) {
		background: #111827;
	}
</style>