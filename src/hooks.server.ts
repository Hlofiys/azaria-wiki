// Server-side performance hooks
import type { Handle } from '@sveltejs/kit';

// Performance monitoring middleware
const performanceMiddleware: Handle = async ({ event, resolve }) => {
	const start = Date.now();

	// Add performance headers
	event.setHeaders({
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin'
	});

	// Resolve the request
	const response = await resolve(event, {
		transformPageChunk: ({ html, done }) => {
			if (done) {
				const duration = Date.now() - start;
				// Add performance timing to HTML if in development
				if (process.env.NODE_ENV === 'development') {
					return html.replace(
						'</head>',
						`<script>console.log('SSR took ${duration}ms for ${event.url.pathname}');</script></head>`
					);
				}
			}
			return html;
		}
	});

	// Add performance headers to response
	response.headers.set('X-Response-Time', `${Date.now() - start}ms`);

	// Cache control for static assets
	if (event.url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else if (event.url.pathname.startsWith('/_app/')) {
		// SvelteKit app assets
		response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
	} else {
		// HTML pages - short cache with revalidation
		response.headers.set('Cache-Control', 'public, max-age=300, must-revalidate');
	}

	return response;
};

// Error handling middleware
const errorHandlingMiddleware: Handle = async ({ event, resolve }) => {
	try {
		return await resolve(event);
	} catch (error) {
		console.error('Server error:', error);

		// Return a graceful error response
		return new Response('Internal Server Error', {
			status: 500,
			headers: {
				'Content-Type': 'text/plain'
			}
		});
	}
};

// Combine all middleware
export const handle: Handle = async ({ event, resolve }) => {
	// Apply performance middleware first
	return await performanceMiddleware({
		event,
		resolve: async (event) => {
			// Then apply error handling
			return await errorHandlingMiddleware({
				event,
				resolve: (event) => resolve(event)
			});
		}
	});
};
