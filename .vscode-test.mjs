// .vscode-test.mjs
import { defineConfig } from '@vscode/test-cli';

// suiteTests 使用 vscode-test 测试，当前无法直接支持 ts,它需要编译成js
// unitTests 直接使用 mocha 测试，直接使用 ts
export default defineConfig([
  {
    label: 'suiteTests',
    files: 'out/test/suite/*.test.js',
    mocha: {
      ui: 'tdd',
      timeout: 20000,
      require: ['ts-node/register', 'tsconfig-paths/register'],
    },
  },
]);
