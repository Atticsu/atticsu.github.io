/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#07070a',
          900: '#0d0d12',
          800: '#15151d',
          700: '#22222e',
          600: '#2e2e3d',
        },
        bone: {
          50: '#f4f1ea',
          100: '#e9e5db',
          400: '#9a958a',
          500: '#7a7569',
          600: '#5a564e',
          700: '#3d3a34',
        },
        lamp: {
          300: '#fcd9a6',
          400: '#f9c47e',
          500: '#f5b056',
          600: '#d7913a',
          700: '#a96e26',
        },
        cold: {
          300: '#a6bfff',
          500: '#5b8cff',
          600: '#3f6cdb',
          700: '#2c4a8a',
          900: '#16264a',
        },
      },
      fontFamily: {
        display: ['"Instrument Serif"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      letterSpacing: {
        'mega': '-0.04em',
      },
      animation: {
        'reveal': 'reveal 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'lamp-pulse': 'lamp-pulse 4s ease-in-out infinite',
        'drift': 'drift 18s ease-in-out infinite',
      },
      keyframes: {
        reveal: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'lamp-pulse': {
          '0%, 100%': { opacity: '0.75', filter: 'drop-shadow(0 0 8px rgba(245, 176, 86, 0.4))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 14px rgba(245, 176, 86, 0.7))' },
        },
        drift: {
          '0%, 100%': { transform: 'translate3d(0,0,0)' },
          '50%': { transform: 'translate3d(0,-8px,0)' },
        },
      },
      backgroundImage: {
        'vignette': 'radial-gradient(ellipse at center, transparent 40%, rgba(7,7,10,0.95) 100%)',
        'lamp-glow': 'radial-gradient(circle at center, rgba(245,176,86,0.18) 0%, transparent 65%)',
      },
    },
  },
  plugins: [],
};
