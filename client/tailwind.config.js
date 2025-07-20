/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // dark mode support
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
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

