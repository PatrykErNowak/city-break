const { transform } = require('next/dist/build/swc');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      keyframes: {
        pulse: {
          '0%, 100%': {
            opacity: '1',
          },
          '50%': {
            opacity: '0.1',
          },
        },
      },
    },
  },
  plugins: [],
};
