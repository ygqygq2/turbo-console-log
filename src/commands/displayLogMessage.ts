// 导入vscode模块
import * as vscode from 'vscode';
// 导入DebugMessage模块
import { DebugMessage } from '../debug-message';
// 导入Command模块
import { Command, ExtensionProperties } from '../entities';
// 导入getTabSize函数
import { getTabSize } from '../utilities';

// 导出函数displayLogMessageCommand
export function displayLogMessageCommand(): Command {
  // 返回一个Command对象
  return {
    // 命令名称
    name: 'turboConsoleLog.displayLogMessage',
    // 命令处理函数
    handler: async (
      // 扩展属性
      extensionProperties: ExtensionProperties,
      // js调试消息
      jsDebugMessage: DebugMessage,
    ) => {
      // 获取当前激活的文本编辑器
      const editor: vscode.TextEditor | undefined =
        vscode.window.activeTextEditor;
      // 如果没有激活的文本编辑器，则返回
      if (!editor) {
        return;
      }
      // 获取tab大小
      const tabSize: number | string = getTabSize(editor.options.tabSize);
      // 获取文档
      const document: vscode.TextDocument = editor.document;
      // 遍历当前选择的范围
      for (let index = 0; index < editor.selections.length; index++) {
        // 获取当前选择范围
        const selection: vscode.Selection = editor.selections[index];
        // 声明变量wordUnderCursor
        let wordUnderCursor = '';
        // 获取当前光标所在单词范围
        const rangeUnderCursor: vscode.Range | undefined =
          document.getWordRangeAtPosition(selection.active);
        // if rangeUnderCursor is undefined, `document.getText(undefined)` will return the entire file.
        // 如果rangeUnderCursor为undefined，则返回整个文档
        if (rangeUnderCursor) {
          wordUnderCursor = document.getText(rangeUnderCursor);
        }
        // 获取当前选择文本
        const selectedVar: string =
          document.getText(selection) || wordUnderCursor;
        // 获取当前光标所在行
        const lineOfSelectedVar: number = selection.active.line;
        // 如果选择文本不为空
        if (selectedVar.trim().length !== 0) {
          // 使用编辑器编辑
          await editor.edit((editBuilder) => {
            // 调用jsDebugMessage.msg函数
            jsDebugMessage.msg(
              editBuilder,
              document,
              selectedVar,
              lineOfSelectedVar,
              tabSize,
              extensionProperties,
            );
          });
        }
      }
    },
  };
}
