import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    react: 'src/react/index.tsx',
  },
  format: ['cjs', 'esm'],
  dts: process.env.TSUP_DTS !== 'false',
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ['react'],
});
