import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

const config: Config = {
  darkMode: ['class', '.dark'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  plugins: [animate],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-kalam)', 'system-ui', 'sans-serif'],
        handwriting: ['var(--font-caveat)', 'cursive'],
      },
      spacing: {
        '105': '26.25rem',
        '125': '31.25rem',
      },
      maxWidth: {
        '105': '26.25rem',
      },
      height: {
        '125': '31.25rem',
      },
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
      },
    },
  },
}

export default config
