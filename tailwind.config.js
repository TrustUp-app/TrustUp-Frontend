import { transform } from '@babel/core';
import { opacity } from 'react-native-reanimated/lib/typescript/Colors';
import keyframes from 'react-native-reanimated/lib/typescript/css/stylesheet/keyframes';

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

      animation: {
        'spin-reverse': 'reverse-spin 1.3s linear infinite',
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite ',
      },

      keyframes: {
        'reverse-spin': {
          from: { transform: 'rotate(360deg)' },
          to: { transform: 'rotate(0deg)' },
        },
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.2 },
          '25%': { transform: 'scale(1.1)' },
          '50%': { transform: 'scale(1.2)', opacity: 1 },
          '75%': { transform: 'scale(1.1)' },
        },
      },
    },
  },
  plugins: [],
};
