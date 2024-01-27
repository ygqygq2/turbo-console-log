import * as vscode from 'vscode';
import { Command, ExtensionProperties, Message } from '../entities';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

export function commentAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.commentAllLogMessages',
    handler: async (
      { delimiterInsideMessage, logMessagePrefix, logFunction }: ExtensionProperties,
      args?: unknown[],
    ) => {
      // 获取要使用的logFunction
      function logFunctionToUse(): string {
        if (args && args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
          const firstArg = args[0] as Record<string, unknown>;
          if ('logFunction' in firstArg && typeof firstArg.logFunction === 'string') {
            return firstArg.logFunction;
          }
          return logFunction;
        }
        return logFunction;
      }

      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const { debugMessage } = instanceDebugMessage(editor);

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
