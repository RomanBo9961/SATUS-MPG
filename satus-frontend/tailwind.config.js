/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        'satus-bg': '#050505',
        'satus-neon': '#9ba37d',      
        'satus-bronce': '#cdb632a1',    
        'satus-bronce-dark': '#6e3b15', 
        'satus-dark': '#0f0f0f',
        'satus-alert': '#d83d3de3',
        'satus-on': '#94c229c4',
      },
      fontFamily: {
        
        'mono': ['"JetBrains Mono"', 'monospace'], 
      },
    },
  },
  plugins: [],
}

