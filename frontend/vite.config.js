import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://chat-app-sigma-two-55.vercel.app',
        changeOrigin: true
      }
    }
  }
})