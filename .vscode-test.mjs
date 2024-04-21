// .vscode-test.mjs
import { defineConfig } from '@vscode/test-cli';
import path from 'path';

const workspacePath = path.resolve('sampleWorkspace', 'test.code-workspace');

// suiteTests 使用 vscode-test/mocha 测试，当前无法直接支持 ts,它需要编译成js
// unitTests 使用 vitest 测试，直接使用 ts
export default defineConfig([
  {
    label: 'suiteTests',
    files: 'out/test/suite/*.test.js',
    version: '1.88.0',
    mocha: {
      ui: 'bdd',
      require: ['ts-node/register', 'tsconfig-paths/register'],
    },
    launchArgs: [workspacePath]
      .concat(['--skip-welcome'])
      .concat(['--disable-extensions'])
      .concat(['--skip-release-notes'])
      .concat(['--enable-proposed-api']),
  },
]);
