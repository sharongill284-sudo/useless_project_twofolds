/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        retro: {
          50: '#fbeef3',
          100: '#f7dde7',
          200: '#eeb8cd',
          300: '#e08fa9',
          400: '#d06b8c',
          500: '#c04e74',
          600: '#a83b5e',
          700: '#8c2f4b',
          800: '#70293d',
          900: '#5b2531',
        },
        accent: {
          DEFAULT: '#9e617c',
          light: '#b07a94',
          dark: '#7a4a61',
          glow: '#e89bb5',
        },
        'retro-teal': '#36e2c4',
        'retro-gold': '#f0c36d',
        'retro-cream': '#f5e6d3',
        'retro-dark': '#1a0f1a',
        'retro-darker': '#0d070d',
        'retro-panel': '#241624',
        'retro-panel-light': '#2f1f2f',
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        mono: ['Space Mono', 'monospace'],
        pixel: ['VT323', 'monospace'],
      },
      animation: {
        'scan-line': 'scan-line 8s linear infinite',
        'flicker': 'flicker 4s linear infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'blink': 'blink 1s step-end infinite',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'spin-slow': 'spin-slow 20s linear infinite',
        'spin-reverse-slow': 'spin-reverse-slow 25s linear infinite',
        'boot-up': 'boot-up 0.6s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.4s ease-out',
        'typing-dot': 'typing-dot 1.4s ease-in-out infinite',
        'grid-move': 'grid-move 20s linear infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '48%': { opacity: '1' },
          '49%': { opacity: '0.4' },
          '50%': { opacity: '1' },
          '52%': { opacity: '0.8' },
          '53%': { opacity: '1' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', filter: 'blur(8px)' },
          '50%': { opacity: '0.8', filter: 'blur(12px)' },
        },
        'blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'spin-reverse-slow': {
          '0%': { transform: 'rotate(360deg)' },
          '100%': { transform: 'rotate(0deg)' },
        },
        'boot-up': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'typing-dot': {
          '0%, 60%, 100%': { transform: 'translateY(0)', opacity: '0.4' },
          '30%': { transform: 'translateY(-8px)', opacity: '1' },
        },
        'grid-move': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(50px)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
};
