/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          dark: '#080d1a',
          card: 'rgba(15, 23, 42, 0.75)',
          border: 'rgba(56, 189, 248, 0.2)',
          cyan: '#06b6d4',
          teal: '#14b8a6',
          green: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          accent: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
