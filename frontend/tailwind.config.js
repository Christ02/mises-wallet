/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1A1D24',
          card: '#2C313A',
          border: '#3A3F4A',
        },
        primary: {
          red: '#E53935',
          redAlt: '#E52B34',
        },
        accent: {
          red: '#E53935',
          yellow: '#FFC107',
          blue: '#2196F3',
        },
        positive: '#10b981',
        negative: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

