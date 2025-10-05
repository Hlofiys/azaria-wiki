// Advanced PWA Service Worker for Azaria Wiki
import {
	precacheAndRoute,
	cleanupOutdatedCaches,
	createHandlerBoundToURL
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// This is the place where Workbox will inject the manifest
// DO NOT REMOVE THIS COMMENT - Required for PWA plugin
// eslint-disable-next-line @typescript-eslint/no-unused-expressions
self.__WB_MANIFEST;

// Enable navigation preload if supported
if ('navigationPreload' in self.registration) {
	self.addEventListener('activate', () => {
		self.registration.navigationPreload.enable();
	});
}

// Clean up old caches
cleanupOutdatedCaches();

// Precache all static assets
precacheAndRoute(self.__WB_MANIFEST || []);

// Navigation fallback
const handler = createHandlerBoundToURL('/');
const navigationRoute = new NavigationRoute(handler, {
	denylist: [
		/^\/_/, // Exclude SvelteKit internal routes
		/\/manifest\.json$/,
		/\/favicon\.ico$/,
		/\/robots\.txt$/
	]
});
registerRoute(navigationRoute);

// Cache strategies for different content types

// 1. Static assets (JS, CSS, fonts) - Cache First
registerRoute(
	({ request }) =>
		request.destination === 'script' ||
		request.destination === 'style' ||
		request.destination === 'font',
	new CacheFirst({
		cacheName: 'static-assets',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
				purgeOnQuotaError: true
			})
		]
	})
);

// 2. Images - Cache First with longer expiration
registerRoute(
	({ request }) => request.destination === 'image',
	new CacheFirst({
		cacheName: 'images',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 60,
				maxAgeSeconds: 60 * 60 * 24 * 180, // 6 months
				purgeOnQuotaError: true
			})
		]
	})
);

// 3. API and dynamic content - Network First
registerRoute(
	({ url }) => url.pathname.startsWith('/api/'),
	new NetworkFirst({
		cacheName: 'api-cache',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 24, // 24 hours
				purgeOnQuotaError: true
			})
		]
	})
);

// 4. HTML pages - Stale While Revalidate
registerRoute(
	({ request }) => request.destination === 'document',
	new StaleWhileRevalidate({
		cacheName: 'pages',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 50,
				maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
				purgeOnQuotaError: true
			})
		]
	})
);

// 5. External resources (Google Fonts, Iconify)
registerRoute(
	({ url }) => url.origin === 'https://fonts.googleapis.com',
	new StaleWhileRevalidate({
		cacheName: 'google-fonts-stylesheets'
	})
);

registerRoute(
	({ url }) => url.origin === 'https://fonts.gstatic.com',
	new CacheFirst({
		cacheName: 'google-fonts-webfonts',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 30,
				maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
				purgeOnQuotaError: true
			})
		]
	})
);

registerRoute(
	({ url }) => url.origin === 'https://api.iconify.design',
	new CacheFirst({
		cacheName: 'iconify-icons',
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200]
			}),
			new ExpirationPlugin({
				maxEntries: 100,
				maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
				purgeOnQuotaError: true
			})
		]
	})
);

// Background sync for offline actions (future feature)
self.addEventListener('sync', (event) => {
	if (event.tag === 'background-sync') {
		event.waitUntil(handleBackgroundSync());
	}
});

async function handleBackgroundSync() {
	// Handle any queued offline actions
	console.log('PWA: Background sync triggered');
}

// Push notifications (future feature)
self.addEventListener('push', (event) => {
	const options = {
		body: event.data?.text() || 'Новое содержимое доступно',
		icon: '/favicon.svg',
		badge: '/favicon.svg',
		tag: 'azaria-update',
		requireInteraction: false,
		actions: [
			{
				action: 'open',
				title: 'Открыть',
				icon: '/favicon.svg'
			},
			{
				action: 'close',
				title: 'Закрыть'
			}
		]
	};

	event.waitUntil(self.registration.showNotification('Азария Вики', options));
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
	event.notification.close();

	if (event.action === 'open') {
		event.waitUntil(self.clients.openWindow('/'));
	}
});

// Message handling from main thread
self.addEventListener('message', (event) => {
	if (event.data && event.data.type === 'SKIP_WAITING') {
		self.skipWaiting();
	}

	if (event.data && event.data.type === 'GET_VERSION') {
		event.ports[0].postMessage({ version: self.__WB_MANIFEST?.length || 'unknown' });
	}
});

// Install prompt handling
self.addEventListener('beforeinstallprompt', (event) => {
	// Prevent the default install prompt
	event.preventDefault();

	// Store the event for later use
	self.deferredPrompt = event;

	// Notify the main thread
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage({
				type: 'INSTALL_PROMPT_AVAILABLE'
			});
		});
	});
});

// App installed event
self.addEventListener('appinstalled', () => {
	console.log('PWA: Azaria Wiki installed successfully');

	// Clear the deferred prompt
	self.deferredPrompt = null;

	// Notify analytics or perform post-install actions
	self.clients.matchAll().then((clients) => {
		clients.forEach((client) => {
			client.postMessage({
				type: 'APP_INSTALLED'
			});
		});
	});
});
