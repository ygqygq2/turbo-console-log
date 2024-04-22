import * as vscode from 'vscode';

import { logger } from '@/extension';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

import { Command, ExtensionProperties, Message } from '../typings';

export function uncommentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.uncommentAllLogMessages',
    handler: async ({ delimiterInsideMessage, logMessagePrefix, logFunction }: ExtensionProperties) => {
      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      // 如果没有激活的编辑器，则直接返回
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

      // 遍历所有日志消息，并删除注释
      const singleLineCommentSymbol = debugMessage.getSingleLineCommentSymbol();
      const regex = new RegExp(`${singleLineCommentSymbol}`, 'g');
      logger.info('Uncomment debug log');
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${document.getText(line).replace(regex, '').trim()}\n`,
            );
          });
        });
      });
    },
  };
}
