/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Palette matched to NWN's original UI: flat black panels,
        // copper wire borders, cream labels, amber accents
        auldwyn: {
          gold:   '#E39A44',
          dark:   '#000000',
          panel:  '#050505',
          border: '#8F5A2B',
          text:   '#E8DCC0',
          muted:  '#A5906B',
          red:    '#8B2020',
          green:  '#2A6040',
        },
      },
      fontFamily: {
        serif: ['"Palatino Linotype"', 'Palatino', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
