import { TextDocument } from 'vscode';
import { BracketType } from '../entities';
import { locBrackets } from './locBrackets';

// 导出一个函数，用于计算声明行后的关闭行
export function closingContextLine(
  // 传入文档对象
  document: TextDocument,
  // 声明行号
  declarationLine: number,
  // 括号类型
  bracketType: BracketType,
): number {
  // 打开括号计数
  let nbrOfOpenedBraces = 0;
  // 关闭括号计数
  let nbrOfClosedBraces = 0;
  // 当声明行小于文档行数时，循环
  while (declarationLine < document.lineCount) {
    // 获取声明行中的打开括号和关闭括号的数量
    const { openingBrackets, closingBrackets } = locBrackets(
      document.lineAt(declarationLine).text,
      bracketType,
    );
    // 打开括号计数加一
    nbrOfOpenedBraces += openingBrackets;
    // 关闭括号计数加一
    nbrOfClosedBraces += closingBrackets;
    // 如果打开括号计数减去关闭括号计数等于0，则返回声明行
    if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
      return declarationLine;
    }
    // 声明行加一
    declarationLine++;
  }
  // 返回-1
  return -1;
}
