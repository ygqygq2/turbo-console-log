import { displayLogMessageCommand } from '@/commands/displayLogMessage';
import { ExtensionProperties } from '@/typings/extension/types';
import { test, suite, expect } from 'vitest';
import { Position, TextEditor, window, workspace } from 'vscode';

suite.todo('Extension Test Suite', () => {
  let mockExtensionProperties: ExtensionProperties;
  let testEditor: TextEditor;
  suiteTeardown(() => {
    window.showInformationMessage('All tests done!');
  });

  beforeEach(async () => {
    mockExtensionProperties = {
      wrapLogMessage: false,
      logMessagePrefix: '🚀',
      logMessageSuffix: ':',
      addSemicolonInTheEnd: true,
      insertEmptyLineBeforeLogMessage: false,
      insertEmptyLineAfterLogMessage: false,
      quote: '"',
      delimiterInsideMessage: '~',
      includeFileNameAndLineNum: true,
      logFunction: {},
    };

    testEditor = await workspace.openTextDocument({
      content: '// sample content',
    });
    testEditor = await window.showTextDocument(testEditor);
  });

  afterEach(async () => {
    await testEditor.dispose();
  });

  test.todo('Display Log Message', async () => {
    await displayLogMessageCommand().handler(mockExtensionProperties);

    expect(window.activeTextEditor?.edit).toHaveBeenCalled();

    expect(mockEditor.edit).toHaveBeenCalledWith(expect.any(Function));
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });

  test.todo('Comment All Log Message', () => {});

  test.todo('Uncomment All Log Message', () => {});

  test.todo('Delete All Log Message', () => {});

  test.todo('Update Line Number For All Log Messages', async () => {});
});
