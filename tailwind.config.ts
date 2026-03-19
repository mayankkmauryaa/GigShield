import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "on-secondary": "#003825",
        "on-surface": "#dae2fd",
        "surface-tint": "#c0c1ff",
        "inverse-surface": "#dae2fd",
        "on-error-container": "#ffdad6",
        "background": "#0b1326",
        "on-tertiary-fixed": "#40000d",
        "surface-container-highest": "#2d3449",
        "inverse-on-surface": "#283044",
        "on-primary-fixed": "#07006c",
        "on-primary-fixed-variant": "#2f2ebe",
        "surface-dim": "#0b1326",
        "surface": "#0b1326",
        "primary-container": "#8083ff",
        "on-primary-container": "#0d0096",
        "secondary": "#45dfa4",
        "on-error": "#690005",
        "surface-bright": "#31394d",
        "on-tertiary-fixed-variant": "#92002a",
        "on-primary": "#1000a9",
        "secondary-fixed": "#68fcbf",
        "surface-container-low": "#131b2e",
        "on-tertiary-container": "#5b0017",
        "outline": "#908fa0",
        "on-secondary-fixed": "#002114",
        "surface-container-lowest": "#060e20",
        "on-secondary-container": "#00452e",
        "primary-fixed": "#e1e0ff",
        "surface-container": "#171f33",
        "outline-variant": "#464554",
        "tertiary": "#ffb2b7",
        "primary-fixed-dim": "#c0c1ff",
        "inverse-primary": "#494bd6",
        "tertiary-fixed": "#ffdadb",
        "tertiary-container": "#ff516a",
        "primary": "#c0c1ff",
        "error": "#ffb4ab",
        "error-container": "#93000a",
        "surface-variant": "#2d3449",
        "tertiary-fixed-dim": "#ffb2b7",
        "on-background": "#dae2fd",
        "secondary-container": "#00bd85",
        "secondary-fixed-dim": "#45dfa4",
        "on-tertiary": "#67001b",
        "on-secondary-fixed-variant": "#005137",
        "on-surface-variant": "#c7c4d7",
        "surface-container-high": "#222a3d"
      },
      fontFamily: {
        "headline": ["Manrope", "sans-serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        "full": "9999px"
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
export default config
