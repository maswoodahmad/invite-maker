// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D946EF',
        'primary-dark': '#A21CAF',
        secondary: '#FBBF24',
        accent: '#10B981',
        background: '#FFFBF5',
        surface: '#FFFFFF',
        muted: '#E5E7EB',
        'text-main': '#1F2937',
        'text-muted': '#6B7280',
        error: '#EF4444',
      }
    }
  },
  plugins: [require('tailwind-scrollbar')],
}
