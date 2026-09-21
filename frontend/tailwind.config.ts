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
        dark: {
          950: '#000000', // Pure pitch black
          900: '#060608', // Ultra dark surface
          850: '#0B0B0F', // Card background
          800: '#121217', // Elevated surface
          750: '#18181F', // Interactive component
          700: '#22222B', // Borders & dividers
          600: '#32323F', // Subtle highlights
        },
        navy: {
          950: '#000000', // Override to pure black for global compatibility
          900: '#08080c', // Dark card surface
          850: '#0f0f14', // Elevated card surface
          800: '#161620', // Interactive component background
          700: '#232330', // Borders & dividers
          600: '#333345', // Subtle highlights
        },
        glow: {
          purple: '#A855F7',
          violet: '#8B5CF6',
          fuchsia: '#D946EF',
          magenta: '#C026D3',
        },
        brand: {
          blue: '#2563EB',      // Primary electric blue
          'blue-light': '#3B82F6',
          'blue-dark': '#1D4ED8',
          cyan: '#06B6D4',      // Secondary accent
          'cyan-light': '#22D3EE',
          'cyan-dark': '#0891B2',
          purple: '#8B5CF6',
          'purple-light': '#A855F7',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      boxShadow: {
        'glow-purple': '0 0 60px -15px rgba(168, 85, 247, 0.35)',
        'glow-purple-lg': '0 0 100px -20px rgba(168, 85, 247, 0.45)',
        'glow-white': '0 0 30px -5px rgba(255, 255, 255, 0.2)',
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
