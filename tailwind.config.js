/** @type {import('tailwindcss').Config} */
const appColors = require('./theme/colors.json');

module.exports = {
  content: ['./App.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'signin-orange': '#ff9a76',
        'signin-link': '#0ea5e9',
        'wallet-border': '#FBBF24',
        'wallet-bg': '#FFDAB9',
      },
    },
  },
  plugins: [],
};
