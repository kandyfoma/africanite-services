import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@styles': path.resolve(__dirname, './src/styles'), // Alias for styles directory
      '@components': path.resolve(__dirname, './src/components'), // Alias for components directory (optional)
    },
  },
});