import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
// Change Run at Root
  base: '/burrrtongg-frontend/', 
  
  server: {
    proxy: {
      '/api': {
        target: 'https://muict.app/burrrtongg-backend',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // <- ลบบรรทัดนี้ออก
      },
    },
  },
})