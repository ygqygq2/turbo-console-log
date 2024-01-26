// .vscode-test.mjs
import { defineConfig } from '@vscode/test-cli';

export default defineConfig([
  {
    label: 'suiteTests',
    files: 'out/test/suite/*.test.ts',
    mocha: {
      ui: 'tdd',
      timeout: 20000,
    },
  },
  {
    label: 'unitTests',
    files: 'out/test/unit/*.test.ts',
    mocha: {
      ui: 'tdd',
      timeout: 20000,
    },
  },
]);
