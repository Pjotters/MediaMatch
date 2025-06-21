/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a4d2e', // groen
        accent: '#1976d2', // blauw
        black: '#000',
        white: '#fff',
      },
    },
  },
  plugins: [],
};
