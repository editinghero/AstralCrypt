import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@notion-lock/crypto': path.resolve(__dirname, '../../packages/crypto/src'),
      '@notion-lock/file-format': path.resolve(__dirname, '../../packages/file-format/src'),
      '@notion-lock/zip': path.resolve(__dirname, '../../packages/zip/src'),
      '@notion-lock/security': path.resolve(__dirname, '../../packages/security/src'),
      '@notion-lock/renderer': path.resolve(__dirname, '../../packages/renderer/src'),
      '@notion-lock/ui': path.resolve(__dirname, '../../packages/ui/src'),
    },
  },
});
