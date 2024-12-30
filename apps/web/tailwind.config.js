const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // theme: {
  // 	fontSize: {
  // 		xs: [
  // 			'0.75rem',
  // 			{
  // 				lineHeight: '1rem'
  // 			}
  // 		],
  // 		sm: [
  // 			'0.875rem',
  // 			{
  // 				lineHeight: '1.5rem'
  // 			}
  // 		],
  // 		base: [
  // 			'1rem',
  // 			{
  // 				lineHeight: '1.75rem'
  // 			}
  // 		],
  // 		lg: [
  // 			'1.125rem',
  // 			{
  // 				lineHeight: '2rem'
  // 			}
  // 		],
  // 		xl: [
  // 			'1.25rem',
  // 			{
  // 				lineHeight: '2rem'
  // 			}
  // 		],
  // 		'2xl': [
  // 			'1.5rem',
  // 			{
  // 				lineHeight: '2rem'
  // 			}
  // 		],
  // 		'3xl': [
  // 			'2rem',
  // 			{
  // 				lineHeight: '2.5rem'
  // 			}
  // 		],
  // 		'4xl': [
  // 			'2.5rem',
  // 			{
  // 				lineHeight: '3.5rem'
  // 			}
  // 		],
  // 		'5xl': [
  // 			'3rem',
  // 			{
  // 				lineHeight: '3.5rem'
  // 			}
  // 		],
  // 		'6xl': [
  // 			'3.75rem',
  // 			{
  // 				lineHeight: '1'
  // 			}
  // 		],
  // 		'7xl': [
  // 			'4.5rem',
  // 			{
  // 				lineHeight: '1.1'
  // 			}
  // 		],
  // 		'8xl': [
  // 			'6rem',
  // 			{
  // 				lineHeight: '1'
  // 			}
  // 		],
  // 		'9xl': [
  // 			'8rem',
  // 			{
  // 				lineHeight: '1'
  // 			}
  // 		]
  // 	},
  // 	extend: {
  // 		colors: {
  // 			primary: {
  // 				DEFAULT: 'hsl(var(--primary))',
  // 				foreground: 'hsl(var(--primary-foreground))'
  // 			},
  // 			'primary-hover': '#000000',
  // 			'primary-action': '#2563eb',
  // 			'primary-action-hover': '#1e40af',
  // 			accent: {
  // 				DEFAULT: 'hsl(var(--accent))',
  // 				foreground: 'hsl(var(--accent-foreground))'
  // 			},
  // 			'accent-light': '#60a5fa',
  // 			'swag-dark': '#2563eb',
  // 			'swag-light': '#60a5fa',
  // 			background: 'hsl(var(--background))',
  // 			foreground: 'hsl(var(--foreground))',
  // 			card: {
  // 				DEFAULT: 'hsl(var(--card))',
  // 				foreground: 'hsl(var(--card-foreground))'
  // 			},
  // 			popover: {
  // 				DEFAULT: 'hsl(var(--popover))',
  // 				foreground: 'hsl(var(--popover-foreground))'
  // 			},
  // 			secondary: {
  // 				DEFAULT: 'hsl(var(--secondary))',
  // 				foreground: 'hsl(var(--secondary-foreground))'
  // 			},
  // 			muted: {
  // 				DEFAULT: 'hsl(var(--muted))',
  // 				foreground: 'hsl(var(--muted-foreground))'
  // 			},
  // 			destructive: {
  // 				DEFAULT: 'hsl(var(--destructive))',
  // 				foreground: 'hsl(var(--destructive-foreground))'
  // 			},
  // 			border: 'hsl(var(--border))',
  // 			input: 'hsl(var(--input))',
  // 			ring: 'hsl(var(--ring))',
  // 			chart: {
  // 				'1': 'hsl(var(--chart-1))',
  // 				'2': 'hsl(var(--chart-2))',
  // 				'3': 'hsl(var(--chart-3))',
  // 				'4': 'hsl(var(--chart-4))',
  // 				'5': 'hsl(var(--chart-5))'
  // 			}
  // 		},
  // 		borderRadius: {
  // 			'4xl': '2rem',
  // 			lg: 'var(--radius)',
  // 			md: 'calc(var(--radius) - 2px)',
  // 			sm: 'calc(var(--radius) - 4px)'
  // 		},
  // 		fontFamily: {
  // 			sans: [
  // 				'Inter',
  //                   ...defaultTheme.fontFamily.sans
  //               ],
  // 			display: [
  // 				'Lexend',
  //                   ...defaultTheme.fontFamily.sans
  //               ]
  // 		},
  // 		maxWidth: {
  // 			'2xl': '40rem'
  // 		},
  // 		keyframes: {
  // 			'camera-flash': {
  // 				'0%': {
  // 					opacity: '100'
  // 				},
  // 				'100%': {
  // 					opacity: '0'
  // 				}
  // 			}
  // 		},
  // 		animation: {
  // 			'camera-flash': 'camera-flash 200ms ease-in-out'
  // 		}
  // 	}
  // },
  // corePlugins: {
  //   aspectRatio: false,
  // },
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    require('tailwindcss-animate'),
  ],
  darkMode: ['class'],
}
