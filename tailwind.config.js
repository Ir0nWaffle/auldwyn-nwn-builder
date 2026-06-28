/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        auldwyn: {
          gold:   '#C9A84C',
          dark:   '#1A1209',
          panel:  '#2A1F0D',
          border: '#4A3520',
          text:   '#E8D5A3',
          muted:  '#9A8060',
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
