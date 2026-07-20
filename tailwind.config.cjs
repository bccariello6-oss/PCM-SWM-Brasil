/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./App.tsx",
    "./index.tsx",
  ],
  theme: {
    extend: {
      colors: {
        'blue-swm': '#171C8F',
        'blue-swm-2': '#13aff0',
        'gris-200': '#e5e7eb',
        primary: {
          50: '#eef2ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      fontSize: {
        'title-xxl': ['72px', { lineHeight: '80px', fontWeight: '700' }],
        'title-lg': ['48px', { lineHeight: '56px', fontWeight: '700' }],
        'title-md': ['32px', { lineHeight: '40px', fontWeight: '700' }],
        'cms': ['18px', { lineHeight: '28px' }],
        'c-noir': ['16px', { lineHeight: '24px' }],
      },
    },
  },
  plugins: [],
}
