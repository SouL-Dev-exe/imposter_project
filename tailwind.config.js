/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      colors: {
        // Redefined tactical palette: Noir & Crimson HUD
        tactical: {
          base: '#050505',
          panel: '#09090b',
          border: '#27272a',
          red: '#dc2626',
          crimson: '#991b1b',
        },
        violet: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'laser-scan': 'scan 4s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(220, 38, 38, 0.5)',
        'glow-red-sm': '0 0 10px rgba(220, 38, 38, 0.4)',
        'glow-white': '0 0 20px rgba(255, 255, 255, 0.2)',
        'tactical': '0 0 0 1px rgba(220, 38, 38, 0.2), 0 8px 30px rgba(0, 0, 0, 0.9)',
      },
    },
  },
  plugins: [],
};
