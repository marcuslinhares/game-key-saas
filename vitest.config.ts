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
      include: ['src/**'],
      exclude: [
        'src/**/*.d.ts',
        'src/app/layout.tsx',
        'src/app/favicon.ico',
        'src/app/globals.css',
        'src/lib/supabase.ts', 
        'src/components/ui/**', 
        'src/components/theme-provider.tsx',
        'node_modules/**',
        '.next/**',
      ],
      thresholds: {
        lines: 50,
        functions: 50,
        branches: 50,
        statements: 50,
      },
    },
  },
});
