/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable dark mode support
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'], // Tell Tailwind to use Lato for its 'sans' font stack
      },},
      boxShadow: {
        'bottom-blue-glow': '0 6px 15px -3px rgba(59, 130, 246, 0.7)', // Adjust values for desired glow effect (blue-500 with 70% opacity)
        // You can experiment with different values:
        // '0 8px 20px -5px rgba(59, 130, 246, 0.6)' for a wider, more diffused glow
      },
  },
  plugins: [],
}

