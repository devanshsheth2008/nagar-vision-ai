/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#F5F7FA',
          900: '#FFFFFF',
          850: '#FFFFFF',
          800: '#EDF1F7',
          750: '#E2E8F0',
          700: '#DCE3EA',
          600: '#C4CCD6',
          500: '#94A3B8',
        },
        neon: {
          emerald: '#218838',
          cyan: '#168C8C',
          amber: '#D99A19',
          red: '#C83E3E',
          purple: '#2563A6',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        glow: '0 1px 3px rgba(23, 54, 93, 0.1)',
        'glow-cyan': '0 1px 3px rgba(22, 140, 140, 0.1)',
        'glow-red': '0 1px 3px rgba(200, 62, 62, 0.1)',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.25s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scan-line': 'scan-line 3s linear infinite',
      },
    },
  },
  plugins: [],
};
