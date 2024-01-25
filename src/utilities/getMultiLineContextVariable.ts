import { TextDocument } from 'vscode';
import { BracketType, MultilineContextVariable } from '../entities';
import { locBrackets } from './locBrackets';
import { closingContextLine } from './closingContextLine';

// 导出一个函数，用于获取多行上下文变量
export function getMultiLineContextVariable(
  // 传入文档对象
  document: TextDocument,
  // 传入行号
  lineNum: number,
  // 传入括号类型
  bracketType: BracketType,
  // 传入是否为内部作用域
  innerScope = true,
): MultilineContextVariable | null {
  // 获取括号的位置
  const { openingBrackets, closingBrackets } = locBrackets(
    document.lineAt(lineNum).text,
    bracketType,
  );
  // 如果为内部作用域，并且括号类型相同，则返回null
  if (
    innerScope &&
    openingBrackets !== 0 &&
    openingBrackets === closingBrackets
  ) {
    return null;
  }
  // 当前行号
  let currentLineNum = lineNum - 1;
  // 打开括号的数量
  let nbrOfOpenedBlockType = 0;
  // 关闭括号的数量
  let nbrOfClosedBlockType = 1; // Closing parenthesis
  // 循环检查
  while (currentLineNum >= 0) {
    // 获取当前行文本
    const currentLineText: string = document.lineAt(currentLineNum).text;
    // 获取当前行括号的位置
    const currentLineParenthesis = locBrackets(currentLineText, bracketType);
    // 打开括号的数量加上当前行括号的位置
    nbrOfOpenedBlockType += currentLineParenthesis.openingBrackets;
    // 关闭括号的数量加上当前行括号的位置
    nbrOfClosedBlockType += currentLineParenthesis.closingBrackets;
    // 如果打开括号的数量等于关闭括号的数量，则返回上下文行
    if (nbrOfOpenedBlockType === nbrOfClosedBlockType) {
      return {
        openingContextLine: currentLineNum,
        closingContextLine: closingContextLine(
          document,
          currentLineNum,
          bracketType,
        ),
      };
    }
    // 当前行号减一
    currentLineNum--;
  }
  // 如果括号类型为括号，并且打开括号的数量大于0，则返回上下文行
  if (bracketType === BracketType.PARENTHESIS && openingBrackets > 0) {
    return {
      openingContextLine: lineNum,
      closingContextLine: closingContextLine(document, lineNum, bracketType),
    };
  }
  // 否则返回null
  return null;
}
