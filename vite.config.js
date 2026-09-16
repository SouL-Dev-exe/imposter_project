import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// NOTE: base is set to './' for GitHub Pages compatibility.
// This ensures all asset paths are relative, so the app works
// when served from a sub-path like https://username.github.io/repo-name/

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    // Increase chunk size warning limit for framer-motion
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Split large vendor chunks for better caching
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) return 'react';
            if (id.includes('react-router')) return 'router';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('zustand')) return 'zustand';
          }
        },
      },
    },
  },
});
