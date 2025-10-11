import { defineConfig } from "vite";
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  base: '/',
  build: { 
    outDir: '../dist', 
    sourcemap: false, 
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  server: {
    port: 3000,
    host: true
  }
  // No CSS config - let Vite handle CSS natively without PostCSS
});
