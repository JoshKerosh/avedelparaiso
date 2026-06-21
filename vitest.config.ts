import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    // A dummy URI so modules that validate env at import time don't throw.
    // Tests never open a real connection.
    env: {
      MONGODB_URI: 'mongodb://localhost:27017/test',
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
});
