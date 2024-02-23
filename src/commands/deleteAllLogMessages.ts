import * as vscode from 'vscode';
import { Command, ExtensionProperties, Message } from '../typings';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

// 导出一个函数，用于删除所有日志消息
export function deleteAllLogMessagesCommand(): Command {
  // 返回一个命令
  return {
    // 命令名称
    name: 'turboConsoleLog.deleteAllLogMessages',
    // 命令处理函数
    handler: async (
      // 传入扩展属性
      { delimiterInsideMessage, logMessagePrefix, logFunction }: ExtensionProperties,
    ) => {
      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      // 如果没有激活的编辑器，则返回
      if (!editor) {
        return;
      }
      const { debugMessage } = instanceDebugMessage(editor);
      // 获取当前文档
      const document: vscode.TextDocument = editor.document;
      // 检测所有日志消息
      const logFunctionByLanguageId = debugMessage.languageProcessor.getLogFunction(logFunction);
      const logMessages: Message[] = debugMessage.detectAll(
        document,
        logFunctionByLanguageId,
        logMessagePrefix,
        delimiterInsideMessage,
      );
      console.log(
        '🚀 ~ file: deleteAllLogMessages.ts:29 ~ logMessages:',
        JSON.stringify(logMessages),
      );

      // 遍历所有日志消息，删除日志消息
      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ lines }) => {
            lines.forEach((line: vscode.Range) => {
              editBuilder.delete(line);
            });
          });
        })
        .then((success) => {
          if (success) {
            vscode.window.showInformationMessage('TurboConsoleLog: Delete debug log successes.');
          } else {
            vscode.window.showErrorMessage('TurboConsoleLog: Delete debug log failed.');
          }
        });
    },
  };
}
