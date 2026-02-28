import type { Config } from 'tailwindcss';

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0A0A0B',
        'dark-card': '#151619',
        'dark-border': '#141414',
      },
      backgroundColor: {
        base: '#0A0A0B',
      },
    },
  },
  plugins: [],
} satisfies Config;
