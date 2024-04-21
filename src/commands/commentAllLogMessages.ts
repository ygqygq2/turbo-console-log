import * as vscode from 'vscode';

import { logger } from '@/extension';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

import { Command, ExtensionProperties, Message } from '../typings';

export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: async (
      { delimiterInsideMessage, logMessagePrefix, logFunction }: ExtensionProperties,
      args?: unknown[],
    ) => {
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const { debugMessage } = instanceDebugMessage(editor);

      // 获取要使用的logFunction
      const logFunctionByLanguageId = debugMessage?.getLanguageProcessor().getLogFunction(logFunction);
      function logFunctionToUse(): string {
        if (args && args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
          const firstArg = args[0] as Record<string, unknown>;
          if ('logFunction' in firstArg && typeof firstArg.logFunction === 'string') {
            return firstArg.logFunction;
          }
        }
        return logFunctionByLanguageId;
      }

      const document: vscode.TextDocument = editor.document;
      // 检测所有log消息
      const logMessages: Message[] = debugMessage.detectAll(
        document,
        logFunctionToUse(),
        logMessagePrefix,
        delimiterInsideMessage,
      );

      // 在编辑器中添加注释
      const singleLineCommentSymbol = debugMessage.getSingleLineCommentSymbol();
      logger.info('Comment debug log');
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            editBuilder.insert(
              new vscode.Position(line.start.line, 0),
              `${spaces}${singleLineCommentSymbol} ${document.getText(line).trim()}\n`,
            );
          });
        });
      });
    },
  };
}
