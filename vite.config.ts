import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY || '')
  },
  build: {
    // Suppress chunk size warnings for large AI and UI libraries
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        // Splitting code to improve performance and avoid single-file size issues
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@google/genai')) return 'vendor-genai';
            return 'vendor-libs';
          }
        }
      }
    }
  },
  // Base '/' is standard for root domain deployments like Vercel
  base: '/',
  server: {
    port: 3000,
    strictPort: true
  }
});