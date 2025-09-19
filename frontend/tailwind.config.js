import daisyui from 'daisyui' 


/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-card': '#334155',
        'dark-border': '#475569',
        'accent-blue': '#3b82f6',
        'accent-purple': '#8b5cf6',
        'accent-green': '#10b981',
        'accent-orange': '#f59e0b',
        'accent-red': '#ef4444',
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        'tv-dark': {
          'primary': '#3b82f6',
          'primary-focus': '#2563eb',
          'primary-content': '#ffffff',
          'secondary': '#8b5cf6',
          'secondary-focus': '#7c3aed',
          'secondary-content': '#ffffff',
          'accent': '#10b981',
          'accent-focus': '#059669',
          'accent-content': '#ffffff',
          'neutral': '#1e293b',
          'neutral-focus': '#0f172a',
          'neutral-content': '#e2e8f0',
          'base-100': '#1e293b',
          'base-200': '#334155',
          'base-300': '#475569',
          'base-content': '#e2e8f0',
          'info': '#0ea5e9',
          'success': '#10b981',
          'warning': '#f59e0b',
          'error': '#ef4444',
        },
      },
      "dark", 
      "dracula",
      "night",
      "forest"
    ],
  },
}