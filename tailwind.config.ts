import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: '#f7f4ed',
        neon: {
          cyan: '#a66c43',
          violet: '#6f5848',
          pink: '#bd8b66',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'glow-cyan': '0 12px 32px rgba(61, 45, 32, 0.10)',
        'glow-violet': '0 12px 32px rgba(61, 45, 32, 0.08)',
        'glow-soft': '0 12px 32px rgba(61, 45, 32, 0.06)',
      },
      animation: {
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'aurora': 'aurora 14s ease-in-out infinite alternate',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.55' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        aurora: {
          '0%': { transform: 'translate(-8%, -6%) rotate(0deg) scale(1)' },
          '100%': { transform: 'translate(8%, 8%) rotate(12deg) scale(1.15)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
