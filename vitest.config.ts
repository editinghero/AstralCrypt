import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'browser',
    browser: {
      provider: 'playwright',
      enabled: true,
      headless: true,
    },
  },
  resolve: {
    alias: {
      '@notion-lock/crypto': path.resolve(__dirname, './packages/crypto/src'),
      '@notion-lock/file-format': path.resolve(__dirname, './packages/file-format/src'),
      '@notion-lock/zip': path.resolve(__dirname, './packages/zip/src'),
      '@notion-lock/security': path.resolve(__dirname, './packages/security/src'),
      '@notion-lock/renderer': path.resolve(__dirname, './packages/renderer/src'),
      '@notion-lock/ui': path.resolve(__dirname, './packages/ui/src'),
    },
  },
});
