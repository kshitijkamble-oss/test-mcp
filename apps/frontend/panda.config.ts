import { defineConfig } from '@pandacss/dev';

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  // Where to look for your css declarations
  include: ['./src/**/*.{js,jsx,ts,tsx}'],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      tokens: {
        colors: {
          brand: {
            blue: {
              500: { value: '#006DB6' },
              600: { value: '#005A99' },
              700: { value: '#004880' },
            },
          },
        },
      },
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',
});
