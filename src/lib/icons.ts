import Icon, { addCollection } from '@iconify/svelte';
import { iconCollections } from './icons/collection';

// Icons are baked in at build time (scripts/generate-icons.mjs) — no runtime API calls.
for (const collection of iconCollections) {
	addCollection(collection);
}

export {
	CATEGORY_ORDER,
	categoryIcons,
	categoryNames,
	categoryDescriptions,
	categorySectionLabels,
	getCategoryIcon,
	getCategoryName,
	getCategoryDescription,
	getCategorySectionLabel,
	entryFolio,
	type CategoryType
} from '$lib/utils/categories';

export type UIIconType =
	| 'book'
	| 'dice'
	| 'slot'
	| 'question'
	| 'star'
	| 'search'
	| 'home'
	| 'library'
	| 'faction'
	| 'type'
	| 'status'
	| 'age'
	| 'population'
	| 'loading'
	| 'close'
	| 'zoom-in'
	| 'zoom-out'
	| 'zoom-reset'
	| 'menu'
	| 'shuffle'
	| 'arrow-up'
	| 'arrow-right'
	| 'scale'
	| 'scroll'
	| 'coin';

// UI element icon mappings
export const uiIcons: Record<UIIconType, string> = {
	book: 'mdi:book-open-page-variant',
	dice: 'mdi:dice-6',
	slot: 'mdi:slot-machine',
	question: 'mdi:help-circle',
	star: 'mdi:star',
	search: 'mdi:magnify',
	home: 'mdi:home',
	library: 'mdi:library',
	faction: 'mdi:sword-cross',
	type: 'mdi:clipboard-text',
	status: 'mdi:heart',
	age: 'mdi:clock-time-four',
	population: 'mdi:account-group',
	loading: 'mdi:loading',
	close: 'mdi:close',
	'zoom-in': 'mdi:magnify-plus',
	'zoom-out': 'mdi:magnify-minus',
	'zoom-reset': 'mdi:magnify-scan',
	menu: 'mdi:menu',
	shuffle: 'mdi:shuffle-variant',
	'arrow-up': 'mdi:arrow-up',
	'arrow-right': 'mdi:arrow-right',
	scale: 'mdi:scale-balance',
	scroll: 'mdi:script-text-outline',
	coin: 'mdi:circle-multiple-outline'
};

// Get UI icon name
export function getUIIcon(iconName: UIIconType): string {
	return uiIcons[iconName] || uiIcons.book;
}

// Icon component wrapper for easy usage
export { Icon };
