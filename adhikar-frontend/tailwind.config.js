/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#fff9f2',
          100: '#ffeed6',
          500: '#FF9933', // Deep Indian Saffron
          600: '#e67e1a',
          700: '#cc6600',
        },
        navy: {
          800: '#1A2332', // Deep Navy Blue
          900: '#0F172A',
        },
        ashoka: {
          500: '#128807', // Dark Green
        }
      },
      fontFamily: {
        sans: ['Poppins', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
