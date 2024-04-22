import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from '@vscode/test-electron';
import * as cp from 'child_process';
import path from 'path';

async function main() {
  try {
    const vscodeExecutablePath = await downloadAndUnzipVSCode('1.88.0');
    const [cliPath, ...args] = resolveCliArgsFromVSCodeExecutablePath(vscodeExecutablePath);

    const extensions = ['mathiasfrohlich.kotlin', 'scala-lang.scala'];
    const installExtensionsArgs = extensions.map((extension) => ['--install-extension', extension]).flat();

    cp.spawnSync(cliPath, [...args, ...installExtensionsArgs], {
      encoding: 'utf-8',
      stdio: 'inherit',
    });

    // The folder containing the Extension Manifest package.json
    // Passed to `--extensionDevelopmentPath`
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');

    // The path to test runner
    // Passed to --extensionTestsPath
    const extensionTestsPath = path.resolve(__dirname, `./suite/index`);

    const workspacePath = path.resolve('sampleWorkspace', 'test.code-workspace');

    process.env.TS_NODE_PROJECT = path.resolve(extensionDevelopmentPath, './tsconfig.mocha.json');

    await runTests({
      vscodeExecutablePath,
      extensionDevelopmentPath,
      extensionTestsPath,
      launchArgs: [workspacePath]
        .concat(['--skip-welcome'])
        .concat(['--skip-release-notes'])
        .concat(['--enable-proposed-api']),
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
