/// <reference types="vitest" />
import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^@\/(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  test: {
    include: ['src/test/unit/**/*.spec.ts'],
    coverage: {
      exclude: ['node_modules', 'out', 'src/test', 'src/typings', '.vscode-test'],
    },
  },
});
