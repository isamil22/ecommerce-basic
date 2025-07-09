// frontend/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // This proxy configuration is key for development
    proxy: {
      // Any request starting with /api will be forwarded
      '/api': {
        target: 'http://localhost:8082', // MODIFIED: Changed port to match docker-compose
        changeOrigin: true,
      },
    },
  },
})