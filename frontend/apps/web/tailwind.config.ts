import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#080604',
        charcoal: '#0F0C08',
        'charcoal-2': '#16120D',
        'charcoal-3': '#1C1812',
        slate: '#2A2520',
        smoke: '#3D3830',
        ivory: '#FAF7F0',
        cream: '#F3EDE1',
        linen: '#EDE6D6',
        gold: '#006039',
        'gold-light': '#006039',
        'gold-deep': '#004b2d',
        burgundy: '#4A1622',
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
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
        cormorant: ['Cormorant', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        luxury: '0 32px 80px rgba(8,6,4,0.6), 0 8px 24px rgba(8,6,4,0.3)',
        card: '0 16px 48px rgba(8,6,4,0.4)',
        'gold-sm': '0 0 30px rgba(0,96,57,0.2)',
        'gold-lg': '0 0 60px rgba(0,96,57,0.25), 0 0 120px rgba(0,96,57,0.1)',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        fadeUp: 'fadeUp 0.8s ease forwards',
        fadeIn: 'fadeIn 0.6s ease forwards',
        scaleIn: 'scaleIn 0.5s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #006039, #004b2d)',
        'dark-gradient': 'linear-gradient(to bottom, #080604, #16120D)',
        'radial-gold': 'radial-gradient(ellipse at center, rgba(0,96,57,0.15) 0%, transparent 70%)',
      },
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      'max-sm': { max: '639px' },
      'max-md': { max: '767px' },
      'max-lg': { max: '1023px' },
    },
  },
  plugins: [],
};

export default config;
