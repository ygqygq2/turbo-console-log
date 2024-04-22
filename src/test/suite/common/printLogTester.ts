import assert from 'assert';
import { describe, it } from 'mocha';
import path from 'path';

import { getText } from '@/utils/vscode-utils';

import { TestInfo } from '../types';
import { executeCommandOnFile } from './executeCommandOnFile';

export function printLogTester(testInfo: TestInfo) {
  testInfo.forEach((item) => {
    const { testName, workspaceName, files } = item;
    describe(`Extension Integration Test: add print log for [${testName}]`, function () {
      this.timeout(200000);
      files.forEach((fileInfo) => {
        const { fileName, cursorPosition } = fileInfo;
        const ext = path.extname(fileName);
        it(`should add print log for [${ext}] in file ${fileName}`, async () => {
          const commandName = 'turboConsoleLog.displayLogMessage';
          const resultFileName = fileName.replace(ext, `.result${ext}`);
          const { actual } = await executeCommandOnFile(commandName, workspaceName, fileName, cursorPosition, false);
          const expected = await getText(workspaceName, resultFileName);
          assert.equal(actual, expected);
        });
      });
    });
  });
}
