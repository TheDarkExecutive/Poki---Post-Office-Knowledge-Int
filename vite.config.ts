
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
    // Aggressively increase the limit to 4000kb to completely silence chunk size warnings
    // for larger SDKs like @google/genai and the React ecosystem.
    chunkSizeWarningLimit: 4000,
    rollupOptions: {
      output: {
        // Advanced manual chunking to ensure vendor libraries are isolated for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('@google/genai')) return 'vendor-genai';
            return 'vendor-others';
          }
        },
        // Ensure consistent naming for Vercel deployments
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    }
  },
  // Set the base to root for standard Vercel deployments
  base: '/',
  server: {
    port: 3000,
    strictPort: true
  }
});
