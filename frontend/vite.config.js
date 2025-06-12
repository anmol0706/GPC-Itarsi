import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'https://gpc-itarsi-backend-8dod.onrender.com'),
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // UI libraries
          ui: ['react-toastify', 'gsap'],
          // Utility libraries
          utils: ['axios', 'date-fns'],
        },
        // Increase the chunk size warning limit to 600kb
        chunkSizeWarningLimit: 600,
      }
    },
    // Enable code splitting
    cssCodeSplit: true,
  },
  server: {
    port: 3000,
    open: true,
  },
})
