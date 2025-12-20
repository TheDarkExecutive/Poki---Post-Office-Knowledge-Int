
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      API_KEY: JSON.stringify(process.env.API_KEY)
    }
  },
  build: {
    // Increase the limit to 2000kb to handle larger AI SDKs and React libraries
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // Split vendor libraries into their own chunk for better caching and smaller main bundles
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
});
