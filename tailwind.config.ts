import type { Config } from 'tailwindcss'
import forms from '@tailwindcss/forms'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5',
        success: '#16A34A',
        danger: '#DC2626',
        bg: '#F8F7FF',
        surface: '#FFFFFF',
        'text-primary': '#111827',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [forms],
} satisfies Config
