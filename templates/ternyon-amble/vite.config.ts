import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The frame sequence is served from public/ untouched; keep JS lean.
    target: 'es2020',
  },
});
