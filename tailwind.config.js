import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts,md,svx}'],
	theme: {
		colors: {
			// Base colors (required by Tailwind)
			transparent: 'transparent',
			current: 'currentColor',
			white: '#ffffff',
			black: '#000000',

			// Medieval-Dep-Punk color palette
			'azaria-dark': '#2a0d2e', // Primary background - dark violet
			'azaria-content': '#3a2e3f', // Content background - lighter violet-grey
			'azaria-gold': '#FFD700', // Primary accent - glowing gold
			'azaria-red': '#c81e1e', // Secondary accent - casino red
			'azaria-text': '#f3e9d2', // Main text - warm off-white

			// DaisyUI compatibility colors
			primary: '#FFD700',
			secondary: '#c81e1e',
			accent: '#3a2e3f',
			neutral: '#2a0d2e',
			'base-100': '#2a0d2e',
			'base-200': '#3a2e3f',
			'base-300': '#4a3e4f',
			'base-content': '#f3e9d2',
			info: '#3abff8',
			success: '#36d399',
			warning: '#fbbd23',
			error: '#f87272',

			// Additional shades for flexibility
			gray: {
				50: '#f9fafb',
				100: '#f3f4f6',
				200: '#e5e7eb',
				300: '#d1d5db',
				400: '#9ca3af',
				500: '#6b7280',
				600: '#4b5563',
				700: '#374151',
				800: '#1f2937',
				900: '#111827'
			},
			red: {
				400: '#f87171',
				500: '#ef4444',
				600: '#dc2626'
			},
			green: {
				400: '#4ade80',
				500: '#22c55e'
			},
			blue: {
				500: '#3b82f6'
			},
			yellow: {
				500: '#eab308'
			},
			purple: {
				500: '#a855f7'
			},
			orange: {
				500: '#f97316'
			}
		},
		fontFamily: {
			heading: ['Cinzel Decorative', 'serif'], // Medieval headings
			body: ['Lora', 'serif'], // Readable body text
			sans: ['Lora', 'serif'],
			serif: ['Lora', 'serif']
		},
		extend: {
			boxShadow: {
				'gold-glow': '0 0 10px #FFD700, 0 0 20px #FFD700, 0 0 30px #FFD700',
				'red-glow': '0 0 10px #c81e1e, 0 0 20px #c81e1e'
			}
		}
	},
	plugins: [daisyui],
	daisyui: {
		themes: [
			{
				azaria: {
					primary: '#FFD700',
					'primary-content': '#2a0d2e',
					secondary: '#c81e1e',
					'secondary-content': '#f3e9d2',
					accent: '#3a2e3f',
					'accent-content': '#f3e9d2',
					neutral: '#2a0d2e',
					'neutral-content': '#f3e9d2',
					'base-100': '#2a0d2e',
					'base-200': '#3a2e3f',
					'base-300': '#4a3e4f',
					'base-content': '#f3e9d2',
					info: '#3abff8',
					success: '#36d399',
					warning: '#fbbd23',
					error: '#f87272'
				}
			}
		]
	}
};
