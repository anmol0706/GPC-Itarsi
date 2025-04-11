import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Define global constants that will be replaced at build time
    'process.env.VITE_API_URL': JSON.stringify('https://gpc-itarsi-backend.onrender.com')
  },
  server: {
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'https://gpc-itarsi-backend.onrender.com',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'https://gpc-itarsi-backend.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 2000, // Increase the size limit to 2000kb
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-toastify'],
          utils: ['axios']
        }
      }
    }
  }
})
