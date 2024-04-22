import * as fs from 'fs-extra';
import path from 'path';
import * as vscode from 'vscode';

/**
 * gets the workspace folder by name
 * @param workspaceFolderName Workspace folder name
 */
export const getWorkspaceFolderUriByName = (workspaceFolderName: string) => {
  const workspaceFolder = vscode.workspace.workspaceFolders!.find((folder) => {
    return folder.name === workspaceFolderName;
  });
  if (!workspaceFolder) {
    throw new Error('Folder not found in workspace. Did you forget to add the test folder to test.code-workspace?');
  }
  return workspaceFolder?.uri || '';
};

export async function getText(workspaceFolderName: string, expectedFile: string) {
  const base = getWorkspaceFolderUriByName(workspaceFolderName);
  const expectedPath = path.join(base.fsPath, expectedFile);
  const expected = await fs.readFile(expectedPath, 'utf8');
  return expected;
}
