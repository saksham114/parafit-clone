import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ECF7F2',
          100: '#D6EFE5',
          200: '#AEE1CB',
          300: '#84D3B1',
          400: '#5DC79B',
          500: '#2E7D32',
          600: '#276C2B',
          700: '#1F5823',
          800: '#17441B',
          900: '#0F2F13'
        },
        gray: { 25: '#FCFEFF' },
        coral: { 500: '#FF6F61' },
        warn: { 500: '#F5B041' },
        ok: { 500: '#2ECC71' },
        danger: { 500: '#E74C3C' },
        primary: {
          DEFAULT: '#2E7D32',
          600: '#276C2B',
          700: '#1F5823',
        },
        surface: '#F9FAFB',
        card: '#FFFFFF',
        accent: '#37D0B2',
        warning: '#F5B041',
        error: '#E74C3C',
        'text-primary': '#1F2937',
        'text-secondary': '#6B7280',
        background: '#F9FAFB',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        'full': '9999px',
      },
      boxShadow: {
        'card': '0 10px 24px rgba(16,24,40,.06), 0 2px 6px rgba(16,24,40,.04)',
        'inset': 'inset 0 1px 0 rgba(255,255,255,0.3)',
        'soft': '0 4px 20px rgba(0, 0, 0, 0.15)',
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '2.5rem' }], // 32px
        'title': ['1.5rem', { lineHeight: '2rem' }],   // 24px
        'heading': ['1.125rem', { lineHeight: '1.5rem' }], // 18px
        'body': ['1rem', { lineHeight: '1.5rem' }],    // 16px
        'small': ['0.875rem', { lineHeight: '1.25rem' }], // 14px
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(ellipse at center, rgba(46, 125, 50, 0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
