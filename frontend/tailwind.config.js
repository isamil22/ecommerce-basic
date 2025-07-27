/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-5px)' },
          '40%': { transform: 'translateX(5px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        },
        // --- NEW ANIMATIONS ---
        pulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
        fade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        }
      },
      animation: {
        nudge: 'nudge 1.5s ease-in-out',
        // --- NEW ANIMATION UTILITIES ---
        'eye-pulse': 'pulse 2s ease-in-out infinite',
        'number-fade': 'fade 0.5s ease-in-out',
      }
    },
  },
  plugins: [],
}