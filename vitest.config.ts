import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.tsx'],
    globals: true,
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary'],
      all: true,
      include: ['src/**'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/layout.tsx',
        'src/app/favicon.ico',
        'src/app/globals.css',
        'src/app/api/**', 
        'src/app/checkout/**', // Checkout tem muitas dependências de imagem e relacionamentos
        'src/lib/supabase.ts', 
        'src/lib/payments/**',
        'src/components/ui/**', 
        'src/components/theme-provider.tsx',
        'src/components/purchases/key-reveal.tsx',
        'src/components/admin/game-form.tsx',
        'src/components/games/search-bar.tsx',
        'src/components/listings/listing-form.tsx',
        'node_modules/**',
        '.next/**',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
