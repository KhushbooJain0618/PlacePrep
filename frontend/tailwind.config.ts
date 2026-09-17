import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#07111F', // Deepest background
          900: '#0B1220', // Surface background
          850: '#0E1729', // Elevated card surface
          800: '#142036', // Interactive component background
          700: '#1E2D4A', // Borders & dividers
          600: '#2A3F66', // Subtle highlights
        },
        brand: {
          blue: '#2563EB',      // Primary electric blue
          'blue-light': '#3B82F6',
          'blue-dark': '#1D4ED8',
          cyan: '#06B6D4',      // Secondary accent
          'cyan-light': '#22D3EE',
          'cyan-dark': '#0891B2',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wave': 'wave 1.5s ease-in-out infinite',
      },
      keyframes: {
        wave: {
          '0%, 100%': { height: '12px' },
          '50%': { height: '36px' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
