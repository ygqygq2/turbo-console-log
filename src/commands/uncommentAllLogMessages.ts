import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: async (
      {
        delimiterInsideMessage,
        logMessagePrefix,
        logFunction,
      }: ExtensionProperties,
      jsDebugMessage: DebugMessage,
    ) => {
      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      // 如果没有激活的编辑器，则直接返回
      if (!editor) {
        return;
      }
      // 获取当前文档
      const document: vscode.TextDocument = editor.document;

      // 检测所有日志消息
      const logMessages: Message[] = jsDebugMessage.detectAll(
        document,
        logFunction,
        logMessagePrefix,
        delimiterInsideMessage,
      );
      // 遍历所有日志消息，并删除注释
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replace(/\//g, '').trim()}\n`,
            );
          });
        });
      });
    },
  };
}
