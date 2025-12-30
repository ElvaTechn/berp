/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'neu-base': 'var(--neu-base)',
        'neu-surface': 'var(--neu-surface)',
        'neu-text-primary': 'var(--neu-text-primary)',
        'neu-text-secondary': 'var(--neu-text-secondary)',
        'neu-accent': 'var(--neu-accent)',
      },
      animation: {
        'float': 'subtle-float 6s ease-in-out infinite',
      },
      keyframes: {
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
