/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7651D5',
          hover: '#643ec2',
          light: '#A58AF5',
          50: '#F5F3FF',
          100: '#EDE9FE',
          500: '#7651D5',
          600: '#643ec2',
          700: '#522fa5',
        },
        secondary: '#A58AF5',
        surface: {
          light: '#F6F5F9',
          dark: '#17151F',
          cardLight: '#FFFFFF',
          cardDark: '#252330',
          borderLight: '#E4E2ED',
          borderDark: '#353245',
          mutedLight: '#736F87',
          mutedDark: '#9E9AA8'
        },
        textPrimary: {
          light: '#191722',
          dark: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
