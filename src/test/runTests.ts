import { runTests } from '@vscode/test-electron';
import path from 'path';

import { createSettings } from './ready';

async function main() {
  try {
    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, `./suite/index`);

    const workspacePath = path.resolve('sampleWorkspace', 'test.code-workspace');
    const userDataDirectory = await createSettings();

    // Download VS Code, unzip it and run the integration test
    await runTests({
      version: '1.88.0',
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath]
        .concat(['--skip-welcome'])
        .concat(['--disable-extensions'])
        .concat(['--skip-release-notes'])
        .concat(['--enable-proposed-api'])
        .concat(['--user-data-dir', userDataDirectory]),
    });
  } catch (error) {
    console.error('Failed to run tests');
    if (error instanceof Error) {
      console.error('error message: ' + error.message);
      console.error('error name: ' + error.name);
      console.error('error stack: ' + error.stack);
    } else {
      console.error('No error object: ' + JSON.stringify(error));
    }
    process.exit(1);
  }
}

main();
