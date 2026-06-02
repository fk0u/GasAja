/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gas: {
          green: "#00FF9F",
          orange: "#FF4D00",
          dark: "#121212",
          darker: "#0a0a0a",
          card: "#1e1e1e"
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Or you can use Outfit
      }
    },
  },
  plugins: [],
}
