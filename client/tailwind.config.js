/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // dark mode support
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        shine: {
          '0%': { transform: 'translateX(-100%) skewX(-12deg)' },
          '100%': { transform: 'translateX(200%) skewX(-12deg)' },
        },
      },
      animation: {
        shine: 'shine 1.5s infinite linear', // You can adjust the duration (e.g., 1.5s), timing function (linear), and repetition (infinite)
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'], // use Lato for 'sans' font stack
      },},
      boxShadow: {
        'bottom-blue-glow': '0 6px 15px -3px rgba(59, 130, 246, 0.7)',
      },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}

