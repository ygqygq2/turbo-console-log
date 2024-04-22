import * as fs from 'fs';
import path from 'path';
import * as vscode from 'vscode';

import { sleep } from '@/utils/utils';
import { getWorkspaceFolderUriByName } from '@/utils/vscode-utils';

import { CursorPosition } from '../types';

/**
 * execute command on file
 * @param commandName command name
 * @param workspaceFolderName workspace folder name
 * @param srcFileName path relative to base URI (a workspaceFolder's URI)
 * @returns source code and resulting code
 */
export async function executeCommandOnFile(
  commandName: string,
  workspaceFolderName: string,
  srcFileName: string,
  cursorPosition: CursorPosition,
  shouldRetry = false,
) {
  const ext = path.extname(srcFileName);
  const testFile = srcFileName.replace(ext, `.copy${ext}`);
  const workspace = getWorkspaceFolderUriByName(workspaceFolderName);
  const srcAbsPath = path.join(workspace.fsPath, srcFileName);
  const testAbsPath = path.join(workspace.fsPath, testFile);

  // 复制文件
  fs.copyFileSync(srcAbsPath, testAbsPath);
  // 打开文件
  const doc = await vscode.workspace.openTextDocument(testAbsPath);
  await vscode.window.showTextDocument(doc);
  // 定位光标
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    const { line, character } = cursorPosition;
    const position = new vscode.Position(line, character);
    editor.selection = new vscode.Selection(position, position);
  }

  // 执行之前获取文件内容
  const originText = doc.getText();

  try {
    console.time(testFile);
    const result = await executeCommandWithRetry({
      commandName,
      workspaceFolderName,
      doc,
      originText,
      shouldRetry,
    });
    console.timeEnd(testFile);
    // 关闭文件

    return result;
  } catch (error) {
    console.error('Error executing command:', error);
    throw error;
  } finally {
    if (fs.existsSync(testAbsPath)) {
      try {
        await fs.promises.unlink(testAbsPath);
        console.log(`File [${testFile}] deleted successfully`);
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
}

async function executeCommandWithRetry(options: {
  commandName: string;
  workspaceFolderName: string;
  doc: vscode.TextDocument;
  originText: string;
  shouldRetry: boolean;
}) {
  const { commandName, workspaceFolderName, doc, originText, shouldRetry } = options;
  let actual = '';
  let retryCount = 0;

  do {
    await vscode.commands.executeCommand(commandName, { workspaceFolderName });
    // 需要等待一段时间才能获取到结果，而且性能低的时候需要更长时间
    await sleep(1000);
    actual = doc.getText();
    retryCount++;
  } while (shouldRetry && originText === actual && retryCount < 3);

  return { actual, source: originText };
}
