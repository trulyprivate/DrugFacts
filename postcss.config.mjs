/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {
      // Modern browser autoprefixer settings
      overrideBrowserslist: [
        '> 1%',
        'last 2 versions',
        'not dead',
        'not ie 11',
        'not chrome < 88',
        'not firefox < 85',
        'not safari < 14',
        'not edge < 88',
      ],
      // Enable modern CSS features
      flexbox: 'no-2009',
      grid: 'autoplace',
    },
  },
}

export default config