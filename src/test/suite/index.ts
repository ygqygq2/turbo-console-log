import { glob } from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

// 为了解析别名
require('tsconfig-paths/register');
require('ts-node/register');

export async function run() {
  const testsRoot = path.resolve(__dirname, '..');

  // 创建 mocha 实例
  const mocha = new Mocha({
    ui: 'bdd',
    color: true,
  });

  // 获取所有测试文件
  const tsFiles = await glob('**/*.test.js', { cwd: testsRoot });
  console.log('获取到以下测试文件:');
  console.log('🚀 ~ file: index.ts:21 ~ tsFiles:', tsFiles);

  return new Promise<void>((resolve, reject) => {
    // 添加测试文件
    tsFiles.forEach((file: string) => {
      mocha.addFile(path.resolve(testsRoot, file));
    });

    // 运行测试
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  }).catch((err) => {
    console.error(err);
    return Promise.reject(err);
  });
}
