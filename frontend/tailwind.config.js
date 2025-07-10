/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Defines the keyframes for our custom animation
      keyframes: {
        nudge: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-5px)' },
          '40%': { transform: 'translateX(5px)' },
          '60%': { transform: 'translateX(-3px)' },
          '80%': { transform: 'translateX(3px)' },
        }
      },
      // Creates the utility class for the animation
      animation: {
        // MODIFICATION: Added 'infinite' to make the animation loop continuously.
        nudge: 'nudge 1.5s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}