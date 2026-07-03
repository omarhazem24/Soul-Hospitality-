/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: 'var(--color-brand)',
        white: 'var(--color-white)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        text: 'var(--color-text)'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      letterSpacing: {
        luxury: '0.18em'
      },
      borderRadius: {
        luxury: '0.5rem'
      },
      boxShadow: {
        luxury: '0 24px 72px rgba(40, 63, 94, 0.12)'
      }
    }
  },
  plugins: []
};
