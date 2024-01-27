// 导出一个函数，用于计算字符串中指定括号的数量
import { BracketType, LogBracket } from '../entities';

export function locBrackets(loc: string, bracketType: BracketType): LogBracket {
  // 定义打开括号的数量
  let openingBrackets = 0;
  // 定义关闭括号的数量
  let closingBrackets = 0;
  // 根据指定括号类型，定义打开括号的正则表达式
  const openedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
  // 根据指定括号类型，定义关闭括号的正则表达式
  const closedElement: RegExp =
    bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
  // 循环检查字符串中是否有打开括号
  while (openedElement.exec(loc)) {
    // 如果有，则打开括号数量加1
    openingBrackets++;
  }
  // 循环检查字符串中是否有关闭括号
  while (closedElement.exec(loc)) {
    // 如果有，则关闭括号数量加1
    closingBrackets++;
  }
  // 返回打开括号和关闭括号的数量
  return {
    openingBrackets,
    closingBrackets,
  };
}
