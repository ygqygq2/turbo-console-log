import { TextDocument } from 'vscode';

/**
 * 返回指定行开头的所有空白字符（可用于缩进检测）
 * @param document 文档对象
 * @param lineNumber 行号
 */
export function spacesBeforeLine(document: TextDocument, lineNumber: number): string {
  const { text, firstNonWhitespaceCharacterIndex: idx } = document.lineAt(lineNumber);
  return text.slice(0, idx);
}
