import * as vscode from 'vscode';

import { logger } from '@/extension';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

import { Command, ExtensionProperties, Message } from '../typings';

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
      const logFunctionByLanguageId = debugMessage?.getLanguageProcessor().getLogFunction(logFunction);
      const logMessages: Message[] = debugMessage.detectAllDebugLine(
        document,
        logFunctionByLanguageId,
        logMessagePrefix,
        delimiterInsideMessage,
      );

      // 遍历所有日志消息，删除日志消息
      editor
        .edit((editBuilder) => {
          logMessages.forEach(({ lines }) => {
            lines.forEach((line: vscode.Range) => {
              // 删除调试日志行
              editBuilder.delete(line);
              // 删除当前行前面的空行
              let lineNumber = line.start.line - 1;
              while (lineNumber >= 0 && document.lineAt(lineNumber).isEmptyOrWhitespace) {
                const lineToDelete = document.lineAt(lineNumber).rangeIncludingLineBreak;
                editBuilder.delete(lineToDelete);
                lineNumber--;
              }
              // 删除当前行后面的空行
              lineNumber = line.end.line;
              while (lineNumber < document.lineCount && document.lineAt(lineNumber).isEmptyOrWhitespace) {
                const lineToDelete = document.lineAt(lineNumber).rangeIncludingLineBreak;
                editBuilder.delete(lineToDelete);
                lineNumber++;
              }
            });
          });
        })
        .then((success) => {
          if (success) {
            logger.info('Delete debug log success.');
          } else {
            logger.info('Delete debug log failed.');
          }
        });
    },
  };
}
