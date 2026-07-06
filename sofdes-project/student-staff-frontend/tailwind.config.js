/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        campus: {
          ink: '#102027',
          green: '#0f766e',
          gold: '#f2b705',
          sky: '#2f80ed',
          coral: '#e85d4f',
          mist: '#edf6f4',
        },
      },
      boxShadow: {
        soft: '0 18px 45px rgba(16, 32, 39, 0.10)',
      },
    },
  },
  plugins: [],
};
