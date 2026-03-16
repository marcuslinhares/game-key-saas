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
        'src/components/listings/listing-form.tsx',
        'src/components/admin/game-form.tsx',
        'src/app/admin/games/page.tsx',
        'src/app/checkout/[listingId]/page.tsx',
        'src/app/games/[id]/page.tsx',
        'src/app/suporte/page.tsx',
        'src/app/termos/page.tsx',
        'src/app/privacidade/page.tsx',
        'src/app/contato/page.tsx',
        'src/app/vender/page.tsx',
        'src/app/dashboard/page.tsx',
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
