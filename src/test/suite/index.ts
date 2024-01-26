import * as path from 'path';
import Mocha from 'mocha';
import { glob } from 'glob';

export async function run(): Promise<void> {
  // Create the mocha test
  const mocha = new Mocha({
    ui: 'tdd',
    color: true,
  });
  mocha.timeout(10000);
  const testsRoot = path.resolve(__dirname, '..');

  const tsFiles = await glob('**/**.test.ts');
  console.log('🚀 ~ run ~ tsFiles:', tsFiles);
  return new Promise<void>((resolve, reject) => {
    // Add files to the test suite
    tsFiles.forEach((file) => {
      const testFile = path.resolve(testsRoot, file);
      mocha.addFile(testFile);
    });

    try {
      // Run the mocha test
      mocha.run((failures) => {
        if (failures > 0) {
          reject(new Error(`${failures} tests failed.`));
        } else {
          resolve();
        }
      });
    } catch (err) {
      console.error(err);
      reject(err);
    }
  });
}
