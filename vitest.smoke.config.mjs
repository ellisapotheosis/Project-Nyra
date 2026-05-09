import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/setup/vitest.setup.ts'],
    include: ['tests/unit/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', 'build/**', '.next/**']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './apps/webapp/app'),
      '@tests': resolve(__dirname, './tests'),
      '@utils': resolve(__dirname, './tests/utils')
    }
  }
};
