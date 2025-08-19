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
        primary: {
          DEFAULT: '#00B887',
          600: '#00A47A',
          700: '#0B8E6D',
        },
        surface: '#0E1114',
        card: '#14191E',
        accent: '#37D0B2',
        warning: '#FFB020',
        error: '#FF5A5F',
        'text-primary': '#E6F6F2',
        'text-secondary': '#A3B8B3',
        background: '#0E1114',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
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
        'radial-gradient': 'radial-gradient(ellipse at center, rgba(0, 184, 135, 0.1) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
