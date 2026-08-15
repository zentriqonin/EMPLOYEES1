/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#14213D',
          ivory: '#FBF8F2',
          gold: '#C9A15A',
          steel: '#3A5A8C',
          warmgray: '#E5E0D5',
          grayblue: '#9AA5BD',
          muted: '#8A8676',
        },
        navy: {
          950: '#0b1329',
          900: '#111e35',
          850: '#182440',
          800: '#1c2847',
          750: '#233257',
          700: '#2a3b63',
        },
        zen: {
          primary: '#2563EB',
          accent: '#4F46E5',
          bg: '#F5F7FB',
          text: '#172033',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
