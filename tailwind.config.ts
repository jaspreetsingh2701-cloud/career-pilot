import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      page: 'rgb(var(--page) / <alpha-value>)',
      card: 'rgb(var(--card) / <alpha-value>)',
      muted: 'rgb(var(--muted) / <alpha-value>)',
      border: 'rgb(var(--border) / <alpha-value>)',
      'border-input': 'rgb(var(--border-input) / <alpha-value>)',
      'text-primary': 'rgb(var(--text-primary) / <alpha-value>)',
      'text-secondary': 'rgb(var(--text-secondary) / <alpha-value>)',
      accent: 'rgb(var(--accent) / <alpha-value>)',
      success: { DEFAULT: 'rgb(var(--success) / <alpha-value>)', bg: 'rgb(var(--success-bg) / <alpha-value>)' },
      warning: { DEFAULT: 'rgb(var(--warning) / <alpha-value>)', bg: 'rgb(var(--warning-bg) / <alpha-value>)', border: 'rgb(var(--warning-border) / <alpha-value>)' },
      danger: 'rgb(var(--danger) / <alpha-value>)',
    },
    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    borderRadius: { card: '10px', control: '8px' },
    spacing: { panel: '16px', card: '12px' }
  } },
  plugins: [],
} satisfies Config;
