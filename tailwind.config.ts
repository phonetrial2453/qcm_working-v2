
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				barlow: ['Barlow', 'sans-serif'],
				handwriting: ['Dancing Script', 'cursive'],
				arabic: ['"Scheherazade New"', 'serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Custom theme colors with expanded palette
				islamic: {
					primary: '#1D4B44',
					secondary: '#3A6B35',
					accent: '#FFC13B',
					blue: '#1E3D59',
					light: '#F5F5F5',
					dark: '#333333',
				},
				// Expanded theme colors for each theme
				green: {
					50: '#e6f0ef',
					100: '#cce0df',
					200: '#99c2bf',
					300: '#66a39e',
					400: '#33857e',
					500: '#1D4B44',
					600: '#17413b',
					700: '#113631',
					800: '#0c2b27',
					900: '#06201e',
				},
				blue: {
					50: '#e6f0fd',
					100: '#cce0fc',
					200: '#99c2f9',
					300: '#66a3f6',
					400: '#3385f3',
					500: '#1E3D59',
					600: '#17344c',
					700: '#112b3e',
					800: '#0c2231',
					900: '#061823',
				},
				purple: {
					50: '#f2edfb',
					100: '#e6dbf8',
					200: '#cdb6f1',
					300: '#b592e9',
					400: '#9c6de2',
					500: '#7E69AB',
					600: '#6b59a1',
					700: '#584a97',
					800: '#463a8d',
					900: '#332b83',
				},
				brown: {
					50: '#f9f5eb',
					100: '#f3ebd7',
					200: '#e7d7ae',
					300: '#dbc386',
					400: '#cfaf5d',
					500: '#c39b34',
					600: '#a6842c',
					700: '#896d25',
					800: '#6c561d',
					900: '#503f16',
				},
				teal: {
					50: '#e6faf6',
					100: '#ccf5ed',
					200: '#99ebdb',
					300: '#66e0c9',
					400: '#33d6b7',
					500: '#00cca5',
					600: '#00ad8b',
					700: '#008e71',
					800: '#006e58',
					900: '#004f3e',
				},
				indigo: {
					50: '#eceefe',
					100: '#d9dcfe',
					200: '#b3bafd',
					300: '#8d97fc',
					400: '#6675fb',
					500: '#4052fa',
					600: '#3646d4',
					700: '#2c3aae',
					800: '#222e88',
					900: '#182262',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
