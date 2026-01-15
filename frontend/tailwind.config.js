/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'parchment': '#d4b896',
        'parchment-dark': '#b8956c',
        'wood-dark': '#3d2914',
        'wood-light': '#5c3d1e',
        'stone-dark': '#2a2a2a',
        'stone-light': '#4a4a4a',
        'gold': '#c9a227',
        'gold-light': '#e6c84a',
        'blood-red': '#8b0000',
        'night-blue': '#0a0a1a',
      },
      fontFamily: {
        'medieval': ['Cormorant Garamond', 'Noto Serif', 'Georgia', 'serif'],
        'fantasy': ['Cormorant Garamond', 'Noto Serif', 'Times New Roman', 'serif'],
        'heading': ['Cormorant Garamond', 'Noto Serif', 'Georgia', 'serif'],
        'display': ['Cormorant Garamond', 'Noto Serif', 'Georgia', 'serif'],
        'ui': ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      backgroundImage: {
        'wood-texture': "url('/assets/textures/wood-panel.png')",
        'stone-texture': "url('/assets/textures/stone-panel.png')",
        'parchment-texture': "url('/assets/textures/parchment.png')",
      },
      boxShadow: {
        'medieval': '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'inset-dark': 'inset 0 2px 4px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
