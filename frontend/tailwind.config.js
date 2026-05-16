/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mams-orange': '#FF5F1F', // Electric Orange
        'mams-bg': '#F9F9F9',     // Clean Off-white
        'mams-dark': '#111111',   // Bold Dark
      },
      fontFamily: {
        'brand': ['Inter', 'sans-serif'], // Professional & Modern
      },
    },
  },
  plugins: [],
}