/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#050403',
        charcoal: '#100B07',
        'charcoal-2': '#17100A',
        'charcoal-3': '#21160D',
        slate: '#2A2520',
        smoke: '#3D3830',
        ivory: '#FAF7F0',
        cream: '#F3EDE1',
        linen: '#EDE6D6',
        gold: '#C7A45A',
        'gold-light': '#E4C77C',
        'gold-deep': '#8D6A28',
        rolex: '#006039',
        forest: '#003D2B',
        coffee: '#1D120B',
        burgundy: '#4A1622',
        // shadcn / web CSS variable tokens
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
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Admin/Vendor shared brand palette (amber-based)
        brand: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f3d9a8',
          300: '#eabc6d',
          400: '#e09a38',
          500: '#d4831c',
          600: '#b96514',
          700: '#974b13',
          800: '#7c3c16',
          900: '#663315',
        },
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
        display: ['Playfair Display', 'serif'],
        cormorant: ['Cormorant', 'serif'],
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
        'gold-sm': '0 0 30px rgba(199,164,90,0.18)',
        'gold-lg': '0 0 60px rgba(199,164,90,0.22), 0 0 120px rgba(0,96,57,0.14)',
      },
      animation: {
        marquee: 'marquee 30s linear infinite',
        fadeUp: 'fadeUp 0.8s ease forwards',
        fadeIn: 'fadeIn 0.6s ease forwards',
        scaleIn: 'scaleIn 0.5s ease forwards',
        shimmer: 'shimmer 1.5s infinite',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C7A45A, #8D6A28)',
        'dark-gradient': 'linear-gradient(to bottom, #050403, #17100A)',
        'radial-gold': 'radial-gradient(ellipse at center, rgba(199,164,90,0.15) 0%, transparent 70%)',
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
  plugins: [require('tailwindcss-animate')],
};
