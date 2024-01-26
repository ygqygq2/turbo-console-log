import * as vscode from 'vscode';
import { DebugMessage } from '../debug-message';
import { Command, ExtensionProperties, Message } from '../entities';

// 导出一个函数，用于删除所有日志消息
export function deleteAllLogMessagesCommand(): Command {
  // 返回一个命令
  return {
    // 命令名称
    name: 'turboConsoleLog.deleteAllLogMessages',
    // 命令处理函数
    handler: async (
      // 传入扩展属性
      {
        delimiterInsideMessage,
        logMessagePrefix,
        logFunction,
      }: ExtensionProperties,
      // 传入js调试消息
      jsDebugMessage: DebugMessage,
    ) => {
      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      // 如果没有激活的编辑器，则返回
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
      // 遍历所有日志消息，删除日志消息
      editor.edit((editBuilder) => {
        logMessages.forEach(({ lines }) => {
          const firstLine = lines[0];
          const lastLine = lines[lines.length - 1];
          const lineBeforeFirstLine = new vscode.Range(
            new vscode.Position(firstLine.start.line - 1, 0),
            new vscode.Position(firstLine.end.line - 1, 0),
          );
          const lineAfterLastLine = new vscode.Range(
            new vscode.Position(lastLine.start.line + 1, 0),
            new vscode.Position(lastLine.end.line + 1, 0),
          );
          // 如果当前行是空行，则删除
          if (document.lineAt(lineBeforeFirstLine.start).text === '') {
            editBuilder.delete(lineBeforeFirstLine);
          }
          if (document.lineAt(lineAfterLastLine.start).text === '') {
            editBuilder.delete(lineAfterLastLine);
          }
          // 删除所有日志消息
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
          });
        });
      });
    },
  };
}
