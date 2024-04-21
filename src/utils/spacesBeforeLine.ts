// 导入TextDocument类
import { TextDocument } from 'vscode';

// 导出一个函数，用于计算指定行号前空格的数量
export function spacesBeforeLine(
  // 传入文档对象
  document: TextDocument,
  // 传入行号
  lineNumber: number,
): string {
  // 获取指定行
  const textLine = document.lineAt(lineNumber);
  // 获取指定行第一个非空白字符的索引
  const lineFirstNonWhitespaceCharacterIndex = textLine.firstNonWhitespaceCharacterIndex;
  // 返回指定行号前空格的数量
  return textLine.text
    .split('')
    .splice(0, lineFirstNonWhitespaceCharacterIndex)
    .reduce((previousValue, currentValue) => previousValue + currentValue, '');
}
