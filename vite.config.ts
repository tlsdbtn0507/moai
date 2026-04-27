/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';
import solidPlugin from 'vite-plugin-solid';
import devtools from 'solid-devtools/vite';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [devtools(), solidPlugin()],
  server: {
    port: 3000,
    proxy: {
      '/v1': {
        target: 'https://api.openai.com',
        changeOrigin: true,
      },
      '/storage': {
        target: 'https://firebasestorage.googleapis.com/v0/b/moai-308a3.firebasestorage.app/o',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/storage/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    conditions: ['development', 'browser'],
    alias: {
      'react': fileURLToPath(new URL('./src/utils/empty-module.ts', import.meta.url)),
      'react-dom': fileURLToPath(new URL('./src/utils/empty-module.ts', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['react', 'react-dom'],
    esbuildOptions: {
      plugins: [],
    },
  },
});
