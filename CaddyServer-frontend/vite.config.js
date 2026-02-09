import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Listen on all interfaces
    strictPort: true,
    allowedHosts: true, // Allow all hosts (including lyaritech.cloud)
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/terminal': {
        target: 'ws://localhost:4000',
        ws: true,
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
