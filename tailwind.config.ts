import type { Config } from 'tailwindcss';

export default {
  content: ['./entrypoints/**/*.{html,ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: { extend: {
    colors: {
      page: '#F4F6F9', card: '#FFFFFF', muted: '#EEF0F4', border: '#E1E5EB', 'border-input': '#CBD2DC',
      'text-primary': '#14213D', 'text-secondary': '#4B5565', accent: '#0F766E',
      success: { DEFAULT: '#0B5D3B', bg: '#DDF3E7' }, warning: { DEFAULT: '#7A4A00', bg: '#FFF0CC', border: '#B7791F' },
      danger: '#B42318', section: '#E9EDF2', selected: '#F0FAF7', disabled: '#E7EAF0', 'progress-track': '#E1E5EB'
    },
    fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'] },
    borderRadius: { card: '10px', control: '8px' },
    spacing: { panel: '16px', card: '12px' }
  } },
  plugins: [],
} satisfies Config;
