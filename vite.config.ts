import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  
  // Ensure environment variables are available
  define: {
    // Backup method to inject API key if env vars fail
    __VITE_VIOLET_API_KEY__: JSON.stringify(process.env.VITE_VIOLET_API_KEY || '3Tr2PwndilEui9rgb55XbRzQECupVGKr')
  },
  
  build: {
    outDir: 'dist',
    sourcemap: true,
    
    // Ensure environment variables are included in build
    rollupOptions: {
      external: [],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          violet: ['./src/utils/apiClient']
        }
      }
    }
  },
  
  server: {
    port: 5173,
    host: true,
    
    // Proxy for local development
    proxy: {
      '/wp-json': {
        target: 'https://wp.violetrainwater.com',
        changeOrigin: true,
        secure: true
      }
    }
  },
  
  // Ensure environment variables are loaded
  envDir: '.',
  envPrefix: 'VITE_'
})