import * as vscode from 'vscode';
import { Command, ExtensionProperties, Message } from '../typings';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

export function updateLineNumAllLogMessagesCommand(): Command {
  return {
    name: 'turboConsoleLog.updateLineNumAllLogMessages',
    handler: async (extensionProperties: ExtensionProperties) => {
      const { logFunction, logMessagePrefix, delimiterInsideMessage, includeFileNameAndLineNum } =
        extensionProperties;

      // 获取当前激活的编辑器
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      // 如果没有激活的编辑器，则直接返回
      if (!editor) {
        return;
      }

      const { debugMessage } = instanceDebugMessage(editor);

      // 获取当前文档
      const document: vscode.TextDocument = editor.document;

      // 没有行号，直接退出
      if (!includeFileNameAndLineNum) {
        return;
      }

      // 检测所有日志消息
      const logFunctionByLanguageId = debugMessage.languageProcessor.getLogFunction(logFunction);
      const logMessages: Message[] = debugMessage.detectAll(
        document,
        logFunctionByLanguageId,
        logMessagePrefix,
        delimiterInsideMessage,
      );

      // 遍历所有日志消息，并更新行号
      const oldLineNum = new RegExp(`:(\\d+) ${delimiterInsideMessage}`);
      editor.edit((editBuilder) => {
        logMessages.forEach(({ spaces, lines }) => {
          lines.forEach((line: vscode.Range) => {
            editBuilder.delete(line);
            const text = document
              .getText(line)
              .replace(oldLineNum, `:${line.start.line + 1} ${delimiterInsideMessage}`)
              .trim();
            editBuilder.insert(new vscode.Position(line.start.line, 0), `${spaces}${text}\n`);
          });
        });
      });
    },
  };
}
