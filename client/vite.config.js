import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Forward /api/* to the Express server so the browser never deals with CORS.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
