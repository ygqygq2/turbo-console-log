import { glob } from 'glob';
import Mocha from 'mocha';
import * as path from 'path';

export async function run() {
  // 创建 mocha 实例
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 10000,
  });

  const testsRoot = path.resolve(__dirname, '.');

  // 获取所有测试文件
  const tsFiles = await glob('**/*.test.js', { cwd: testsRoot });
  console.log('获取到以下测试文件:');
  console.log('🚀 ~ file: index.ts:18 ~ tsFiles:', tsFiles);

  return new Promise<void>((resolve, reject) => {
    // 添加测试文件
    tsFiles.forEach((file) => {
      mocha.addFile(path.resolve(testsRoot, file));
    });

    // 运行测试
    mocha.run((failures) => {
      if (failures > 0) {
        reject();
      } else {
        resolve();
      }
    });
  }).catch((err) => {
    console.error(err);
    return Promise.reject(err);
  });
}
