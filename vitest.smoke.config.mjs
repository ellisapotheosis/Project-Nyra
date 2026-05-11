import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: [
      'tests/unit/agents/**/*.test.ts',
      'tests/unit/mortgage/**/*.test.ts',
      'tests/unit/nexus-router/routing.test.ts',
      'tests/unit/swarm/**/*.test.ts',
      'tests/unit/webapp/**/*.test.ts',
    ],
    exclude: ['node_modules/**', 'dist/**', 'build/**', '.next/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/webapp/app'),
      '@tests': resolve(__dirname, './tests'),
      '@utils': resolve(__dirname, './tests/utils'),
      '@jest/globals': resolve(__dirname, './tests/setup/jest-globals-compat.ts')
    }
  }
};
