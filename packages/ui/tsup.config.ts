import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: false, // Отключаем генерацию типов в tsup, будем использовать tsc
  treeshake: true,
  sourcemap: false, // Полностью отключаем source maps для избежания ошибок SWC
  clean: true,
  minify: false, // Отключаем минификацию
  external: ['react', 'react-dom'],
  tsconfig: './tsconfig.json',
  outDir: 'dist',
  esbuildOptions(options) {
    options.conditions = ['module'];
    options.sourcemap = false; // Также отключаем source maps в esbuild
  },
});
