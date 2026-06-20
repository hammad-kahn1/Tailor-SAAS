/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#fdf2f6',
          100: '#fce7ef',
          200: '#f9cee0',
          300: '#f3a8c7',
          400: '#e86682',  /* Light Pink */
          500: '#c84b7c',  /* Pink accent */
          600: '#a62d5d',  /* Mulberry */
          700: '#8B1A4A',  /* Deep Mulberry */
          800: '#6d1238',
          900: '#51132d',
          950: '#27030e',
        },
        mulberry: {
          DEFAULT: '#8B1A4A',
          light: '#fdf2f6',
          dark: '#6d1238',
        },
        navy: {
          DEFAULT: '#1a2744',
          light: '#2d3f6b',
          muted: '#4a5680',
        },
        mint: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        pink: {
          50:  '#fdf2f6',
          100: '#fce7ef',
          200: '#f9cee0',
          300: '#f3a8c7',
          400: '#e86682',
        },
        /* Ink = readable text/surfaces on white background */
        ink: {
          50:  '#f8fafc',   /* Lightest bg tint */
          100: '#f1f5f9',   /* Subtle bg */
          200: '#e2e8f0',   /* Borders */
          300: '#cbd5e1',   /* Muted borders */
          400: '#94a3b8',   /* Placeholder text */
          500: '#64748b',   /* Secondary text */
          600: '#475569',   /* Body text */
          700: '#334155',   /* Strong text */
          800: '#1e293b',   /* Near-black text */
          900: '#0f172a',   /* Primary headings */
          950: '#020617',   /* Darkest */
        },
      },
      fontFamily: {
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        mono:    ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(139,26,74,0.1), 0 2px 6px -1px rgba(139,26,74,0.06)',
        'sidebar': '2px 0 8px 0 rgba(0,0,0,0.05)',
      },
      borderRadius: {
        DEFAULT: '12px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
      },
    },
  },
  plugins: [],
}
