import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// Evitar que Vite resuelva @angular/animations cuando usamos provideNoopAnimations().
// 1) Excluir de optimizeDeps (prebundle)
// 2) Marcar como external en SSR
// 3) Alias a un stub vacío para cualquier import accidental en browser/ssr
export default defineConfig({
  resolve: {
    alias: {
      '@angular/animations': resolve(__dirname, 'src/empty.ts'),
      '@angular/animations/browser': resolve(__dirname, 'src/empty.ts'),
    },
  },
  optimizeDeps: {
    exclude: ['@angular/animations', '@angular/animations/browser'],
  },
  ssr: {
    external: ['@angular/animations', '@angular/animations/browser'],
  },
});
