// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		/** Iconify runtime (loaded from CDN), used for icon preloading */
		Iconify?: {
			preloadIcons?: (icons: string[]) => void;
		};
	}
}

export {};
