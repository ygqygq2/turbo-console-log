import * as vscode from 'vscode';

import { logger } from '@/extension';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

import { Command, ExtensionProperties } from '../typings';

// 插入调试日志/更新调试日志行号
export function displayLogMessageCommand(): Command {
  // 返回一个Command对象
  return {
    // 命令名称
    name: 'turboConsoleLog.displayLogMessage',
    // 命令处理函数
    handler: async (
      // 扩展属性
      extensionProperties: ExtensionProperties,
    ) => {
      // 获取当前激活的文本编辑器
      const editor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
      // 如果没有激活的文本编辑器，则返回
      if (!editor) {
        return;
      }
      const { debugMessage } = instanceDebugMessage(editor);
      // 获取文档
      const document: vscode.TextDocument = editor.document;
      // 遍历当前选择的范围
      for (let index = 0; index < editor.selections.length; index++) {
        // 获取当前选择范围
        const selection: vscode.Selection = editor.selections[index];

        // 获取当前选择文本
        const selectedVar =
          (selection && document.getText(selection)) ||
          (() => {
            // 获取当前光标所在单词范围
            let rangeUnderCursor = document.getWordRangeAtPosition(selection.active);
            if (!rangeUnderCursor) {
              // 如果没有找到匹配的单词，那么向后查找，直到找到一个空格或引号
              let position = selection.active;
              while (position.character < document.lineAt(position.line).text.length) {
                position = position.translate(0, 1);
                rangeUnderCursor = document.getWordRangeAtPosition(position, /\$\w+|\w+/);
                if (rangeUnderCursor) {
                  break;
                }
              }
            }
            return (rangeUnderCursor && document.getText(rangeUnderCursor)) || '';
          })();
        // 获取当前光标所在行
        const lineOfSelectedVar: number = selection.active.line;
        // 如果选择文本不为空
        if (selectedVar.trim().length !== 0) {
          // 使用编辑器编辑
          logger.info('Insert debug log');
          await editor.edit((editBuilder) => {
            // 调用debugMessage.insertMessage函数
            debugMessage.generateAndInsertDebugMessage(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              extensionProperties,
            );
          });
        }
      }
    },
  };
}
