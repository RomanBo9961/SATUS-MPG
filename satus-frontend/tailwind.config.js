/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'satus-bg': '#050505',
        'satus-neon': '#00f2ff',
        'satus-dark': '#0f0f0f',
        'satus-alert': '#ff0055',
      },
    },
  },
  plugins: [],
}
