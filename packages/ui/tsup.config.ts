import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    entry: 'src/index.ts',
    resolve: true,
  },
  sourcemap: true,
  clean: true,
  minify: true,
  external: ['react', 'react-dom'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
});
