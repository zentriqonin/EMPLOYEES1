import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://srv-da019s49v7es738bs2cg:8085',
        changeOrigin: true
      }
    }
  }
})
