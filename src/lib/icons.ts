import Icon from '@iconify/svelte';

// Type definitions
export interface CategoryColors {
	primary: string;
	secondary: string;
	accent: string;
	border: string;
	bg: string;
	glow: string;
}

export type CategoryType =
	| 'characters'
	| 'locations'
	| 'factions'
	| 'artifacts'
	| 'concepts'
	| 'creatures';

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
	| 'zoom-reset';

// Category icon mappings using Iconify icons
export const categoryIcons: Record<CategoryType, string> = {
	characters: 'mdi:crown',
	locations: 'mdi:castle',
	factions: 'mdi:sword-cross',
	artifacts: 'mdi:star-circle',
	concepts: 'mdi:target',
	creatures: 'game-icons:sea-dragon'
};

// Category color mappings for visual distinction
export const categoryColors: Record<CategoryType, CategoryColors> = {
	characters: {
		primary: '#FFD700', // Royal gold
		secondary: '#F4D03F', // Light gold
		accent: '#B7950B', // Dark gold
		border: '#FFD700',
		bg: 'rgba(255, 215, 0, 0.1)',
		glow: 'rgba(255, 215, 0, 0.3)'
	},
	locations: {
		primary: '#5DADE2', // Castle blue
		secondary: '#AED6F1', // Light blue
		accent: '#2E86AB', // Dark blue
		border: '#5DADE2',
		bg: 'rgba(93, 173, 226, 0.1)',
		glow: 'rgba(93, 173, 226, 0.3)'
	},
	factions: {
		primary: '#E74C3C', // War red
		secondary: '#F1948A', // Light red
		accent: '#C0392B', // Dark red
		border: '#E74C3C',
		bg: 'rgba(231, 76, 60, 0.1)',
		glow: 'rgba(231, 76, 60, 0.3)'
	},
	artifacts: {
		primary: '#AF7AC5', // Mystic purple
		secondary: '#D7BDE2', // Light purple
		accent: '#8E44AD', // Dark purple
		border: '#AF7AC5',
		bg: 'rgba(175, 122, 197, 0.1)',
		glow: 'rgba(175, 122, 197, 0.3)'
	},
	concepts: {
		primary: '#58D68D', // Philosophy green
		secondary: '#A9DFBF', // Light green
		accent: '#27AE60', // Dark green
		border: '#58D68D',
		bg: 'rgba(88, 214, 141, 0.1)',
		glow: 'rgba(88, 214, 141, 0.3)'
	},
	creatures: {
		primary: '#F39C12', // Dragon orange
		secondary: '#F8C471', // Light orange
		accent: '#E67E22', // Dark orange
		border: '#F39C12',
		bg: 'rgba(243, 156, 18, 0.1)',
		glow: 'rgba(243, 156, 18, 0.3)'
	}
};

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
	'zoom-reset': 'mdi:magnify-scan'
};

// Get category icon name
export function getCategoryIcon(category: CategoryType): string {
	return categoryIcons[category] || uiIcons.book;
}

// Get category colors
export function getCategoryColors(category: CategoryType): CategoryColors {
	return (
		categoryColors[category] || {
			primary: '#c9a876',
			secondary: '#e6c190',
			accent: '#b8956a',
			border: '#c9a876',
			bg: 'rgba(201, 168, 118, 0.1)',
			glow: 'rgba(201, 168, 118, 0.3)'
		}
	);
}

// Get UI icon name
export function getUIIcon(iconName: UIIconType): string {
	return uiIcons[iconName] || uiIcons.book;
}

// Get Russian category name
export function getCategoryNameRussian(category: CategoryType): string {
	const russianNames: Record<CategoryType, string> = {
		characters: 'Персонажи',
		locations: 'Локации',
		factions: 'Фракции',
		artifacts: 'Артефакты',
		concepts: 'Концепции',
		creatures: 'Существа'
	};
	return russianNames[category] || category;
}

// Icon component wrapper for easy usage
export { Icon };
