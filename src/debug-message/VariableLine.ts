import { TextEditor } from 'vscode';

export class VariableLine {
  private editor: TextEditor;
  private selectedVariable: string | null;

  constructor(editor: TextEditor) {
    this.editor = editor;
    this.selectedVariable = null;
  }

  // 在获取行号的同时,获取选中的变量名
  public getCurrentLine(): {
    line: number | null;
    variable: string | null;
  } {
    const selection = this.editor.selection;

    if (!selection.isEmpty) {
      // 如果文本被选中,获取选中文本作为变量名
      this.selectedVariable = this.editor.document.getText(selection);
      return {
        line: selection.start.line,
        variable: this.selectedVariable,
      };
    }

    // 如果没有选中文本,返回当前行号
    return {
      line: this.editor.selection.active.line,
      variable: null,
    };
  }

  // 当代码行移动时获取行号
  public getMovedLine(originalLine: number, moveOffset: number): number {
    // originalLine 是原始行号，moveOffset 是移动的偏移量（可以是正数或负数）
    const totalLines = this.editor.document.lineCount;
    let newLine = originalLine + moveOffset;

    // 确保新行号不会超出文档的范围
    if (newLine < 0) {
      newLine = 0;
    } else if (newLine >= totalLines) {
      newLine = totalLines - 1;
    }

    return newLine;
  }
}
