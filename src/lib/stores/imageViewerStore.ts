import { writable } from 'svelte/store';

function createImageViewerStore() {
	const { subscribe, set } = writable<{ isOpen: boolean; src: string | null }>({
		isOpen: false,
		src: null
	});

	return {
		subscribe,
		open: (src: string) => set({ isOpen: true, src }),
		close: () => set({ isOpen: false, src: null })
	};
}

export const imageViewer = createImageViewerStore();
