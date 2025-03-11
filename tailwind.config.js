/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0A2463', // Navy Blue
          light: '#1E3D84',
          dark: '#061640',
        },
        accent: {
          DEFAULT: '#BF9B30', // Gold
          light: '#D4B04C',
          dark: '#8C7223',
        }
      }
    },
  },
  plugins: [],
};