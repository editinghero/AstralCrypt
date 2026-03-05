/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./apps/**/*.{js,ts,jsx,tsx}",
    "./packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        notion: {
          bg: '#191919',
          surface: '#202020',
          border: '#2f2f2f',
          text: '#e6e6e6',
          'text-secondary': '#9b9b9b',
          accent: '#3a3a3a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
