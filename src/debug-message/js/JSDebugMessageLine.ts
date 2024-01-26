import { TextDocument } from 'vscode';
import { BracketType, LogContextMetadata, LogMessage, LogMessageType } from '../../entities';
import { DebugMessageLine } from '../types';
import { getMultiLineContextVariable } from '../../utilities';
import { LineCodeProcessing } from '../../line-code-processing';

// 导出JSDebugMessageLine类，实现DebugMessageLine接口
export class JSDebugMessageLine implements DebugMessageLine {
  // 声明一个LineCodeProcessing类型的变量
  lineCodeProcessing: LineCodeProcessing;
  // 构造函数，传入一个LineCodeProcessing类型的参数
  constructor(lineCodeProcessing: LineCodeProcessing) {
    this.lineCodeProcessing = lineCodeProcessing;
  }
  // 定义一个line函数，传入document、selectionLine、selectedVar、logMsg四个参数
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    // 根据logMsg.logMessageType的值，进行不同的操作
    switch (logMsg.logMessageType) {
      // 对象字面量
      case LogMessageType.ObjectLiteral:
        return this.objectLiteralLine(document, selectionLine);
      // 命名函数赋值
      case LogMessageType.NamedFunctionAssignment:
        return this.functionAssignmentLine(document, selectionLine, selectedVar);
      // 装饰器
      case LogMessageType.Decorator:
        return (
          (getMultiLineContextVariable(document, selectionLine, BracketType.PARENTHESIS, false)
            ?.closingContextLine || selectionLine) + 1
        );
      // 多行匿名函数
      case LogMessageType.MultiLineAnonymousFunction:
        return this.functionClosedLine(document, selectionLine, BracketType.CURLY_BRACES) + 1;
      // 对象函数调用赋值
      case LogMessageType.ObjectFunctionCallAssignment:
        return this.objectFunctionCallLine(document, selectionLine, selectedVar);
      // 数组赋值
      case LogMessageType.ArrayAssignment:
        return this.arrayLine(document, selectionLine);
      // 多行括号
      case LogMessageType.MultilineParenthesis:
        return ((logMsg?.metadata as LogContextMetadata)?.closingContextLine || selectionLine) + 1;
      // 三元运算符
      case LogMessageType.Ternary:
        return this.templateStringLine(document, selectionLine);
      // 多行括号
      case LogMessageType.MultilineBraces:
        // Deconstructing assignment
        // 解构赋值
        if ((logMsg?.metadata as LogContextMetadata)?.closingContextLine) {
          return (logMsg?.metadata as LogContextMetadata)?.closingContextLine + 1;
        }
        return selectionLine + 1;
      // 默认
      default:
        return selectionLine + 1;
    }
  }
  private objectLiteralLine(document: TextDocument, selectionLine: number): number {
    // 获取当前行文本
    const currentLineText: string = document.lineAt(selectionLine).text;
    // 获取当前行中{的数量
    let nbrOfOpenedBrackets: number = (currentLineText.match(/{/g) || []).length;
    // 获取当前行中}的数量
    let nbrOfClosedBrackets: number = (currentLineText.match(/}/g) || []).length;
    // 当前行号
    let currentLineNum: number = selectionLine + 1;
    // 循环检查当前行后的每一行
    while (currentLineNum < document.lineCount) {
      // 获取当前行文本
      const currentLineText: string = document.lineAt(currentLineNum).text;
      // 获取当前行中{的数量
      nbrOfOpenedBrackets += (currentLineText.match(/{/g) || []).length;
      // 获取当前行中}的数量
      nbrOfClosedBrackets += (currentLineText.match(/}/g) || []).length;
      // 当前行号加1
      currentLineNum++;
      // 如果{的数量等于}的数量，则跳出循环
      if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
        break;
      }
    }
    // 如果{的数量等于}的数量，则返回当前行号，否则返回当前行号加1
    return nbrOfClosedBrackets === nbrOfOpenedBrackets ? currentLineNum : selectionLine + 1;
  }
  private functionAssignmentLine(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number {
    // 获取当前行文本
    const currentLineText = document.lineAt(selectionLine).text;
    // 如果当前行文本中包含{
    if (/{/.test(currentLineText)) {
      // 如果当前行文本中包含selectedVar
      if (document.lineAt(selectionLine).text.split('=')[1].includes(selectedVar)) {
        // 返回当前行号加1
        return selectionLine + 1;
      }
      // 返回当前行号加上当前行文本中最后一个}的行号
      return this.closingElementLine(document, selectionLine, BracketType.CURLY_BRACES) + 1;
    } else {
      // 如果当前行文本中不包含{
      // 获取当前行文本中最后一个(的行号
      const closedParenthesisLine = this.closingElementLine(
        document,
        selectionLine,
        BracketType.PARENTHESIS,
      );
      // 返回当前行号加上最后一个(的行号加上最后一个}的行号
      return this.closingElementLine(document, closedParenthesisLine, BracketType.CURLY_BRACES) + 1;
    }
  }
  /**
   * Log line of a variable in multiline context (function parameter, or deconstructed object, etc.)
   */
  private functionClosedLine(
    document: TextDocument,
    declarationLine: number,
    bracketType: BracketType,
  ): number {
    let nbrOfOpenedBraces = 0;
    let nbrOfClosedBraces = 0;
    while (declarationLine < document.lineCount) {
      const { openedElementOccurrences, closedElementOccurrences } =
        this.locOpenedClosedElementOccurrences(document.lineAt(declarationLine).text, bracketType);
      nbrOfOpenedBraces += openedElementOccurrences;
      nbrOfClosedBraces += closedElementOccurrences;
      if (nbrOfOpenedBraces - nbrOfClosedBraces === 0) {
        return declarationLine;
      }
      declarationLine++;
    }
    return -1;
  }
  private objectFunctionCallLine(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): number {
    // 获取当前行文本
    let currentLineText: string = document.lineAt(selectionLine).text;
    // 获取下一行文本
    let nextLineText: string = document.lineAt(selectionLine + 1).text.replace(/\s/g, '');
    // 判断当前行文本是否为函数调用
    if (
      /\((\s*)$/.test(currentLineText.split(selectedVar)[0]) ||
      /,(\s*)$/.test(currentLineText.split(selectedVar)[0])
    ) {
      return selectionLine + 1;
    }
    // 定义打开的括号数量和关闭的括号数量
    let totalOpenedParenthesis = 0;
    let totalClosedParenthesis = 0;
    // 获取当前行文本中打开的元素和关闭的元素
    const { openedElementOccurrences, closedElementOccurrences } =
      this.locOpenedClosedElementOccurrences(currentLineText, BracketType.PARENTHESIS);
    // 计算打开的括号数量
    totalOpenedParenthesis += openedElementOccurrences;
    // 计算关闭的括号数量
    totalClosedParenthesis += closedElementOccurrences;
    // 定义当前行号
    let currentLineNum = selectionLine + 1;
    // 判断当前行文本是否为函数调用
    if (
      totalOpenedParenthesis !== totalClosedParenthesis ||
      currentLineText.endsWith('.') ||
      nextLineText.trim().startsWith('.')
    ) {
      // 判断当前行文本是否为函数调用
      while (currentLineNum < document.lineCount) {
        // 获取当前行文本
        currentLineText = document.lineAt(currentLineNum).text;
        // 获取当前行文本中打开的元素和关闭的元素
        const { openedElementOccurrences, closedElementOccurrences } =
          this.locOpenedClosedElementOccurrences(currentLineText, BracketType.PARENTHESIS);
        // 计算打开的括号数量
        totalOpenedParenthesis += openedElementOccurrences;
        // 计算关闭的括号数量
        totalClosedParenthesis += closedElementOccurrences;
        // 判断当前行是否为最后一行
        if (currentLineNum === document.lineCount - 1) {
          break;
        }
        // 获取下一行文本
        nextLineText = document.lineAt(currentLineNum + 1).text;
        // 当前行号自增
        currentLineNum++;
        // 判断当前行文本是否为函数调用
        if (
          totalOpenedParenthesis === totalClosedParenthesis &&
          !currentLineText.endsWith('.') &&
          !nextLineText.trim().startsWith('.')
        ) {
          break;
        }
      }
    }
    // 判断当前行文本是否为函数调用
    return totalOpenedParenthesis === totalClosedParenthesis ? currentLineNum : selectionLine + 1;
  }
  private arrayLine(document: TextDocument, selectionLine: number): number {
    // 获取当前行文本
    const currentLineText: string = document.lineAt(selectionLine).text;
    // 获取当前行中左括号的数量
    let nbrOfOpenedBrackets: number = (currentLineText.match(/\[/g) || []).length;
    // 获取当前行中右括号的数量
    let nbrOfClosedBrackets: number = (currentLineText.match(/\]/g) || []).length;
    // 当前行号
    let currentLineNum: number = selectionLine + 1;
    // 如果左括号的数量不等于右括号的数量，则循环检查
    if (nbrOfOpenedBrackets !== nbrOfClosedBrackets) {
      while (currentLineNum < document.lineCount) {
        // 获取当前行文本
        const currentLineText: string = document.lineAt(currentLineNum).text;
        // 获取当前行中左括号的数量
        nbrOfOpenedBrackets += (currentLineText.match(/\[/g) || []).length;
        // 获取当前行中右括号的数量
        nbrOfClosedBrackets += (currentLineText.match(/\]/g) || []).length;
        // 当前行号加1
        currentLineNum++;
        // 如果左括号的数量等于右括号的数量，则跳出循环
        if (nbrOfOpenedBrackets === nbrOfClosedBrackets) {
          break;
        }
      }
    }
    // 如果左括号的数量等于右括号的数量，则返回当前行号，否则返回选择行号加1
    return nbrOfOpenedBrackets === nbrOfClosedBrackets ? currentLineNum : selectionLine + 1;
  }
  private templateStringLine(document: TextDocument, selectionLine: number): number {
    // 获取当前行文本
    const currentLineText: string = document.lineAt(selectionLine).text;
    // 当前行数
    let currentLineNum: number = selectionLine + 1;
    // 当前行中`的数量
    let nbrOfBackticks: number = (currentLineText.match(/`/g) || []).length;
    // 如果当前行数小于文档行数，则循环检查
    while (currentLineNum < document.lineCount) {
      // 获取当前行文本
      const currentLineText: string = document.lineAt(currentLineNum).text;
      // 当前行中`的数量
      nbrOfBackticks += (currentLineText.match(/`/g) || []).length;
      // 如果`的数量为偶数，则跳出循环
      if (nbrOfBackticks % 2 === 0) {
        break;
      }
      // 当前行数加1
      currentLineNum++;
    }
    // 如果`的数量为偶数，则返回当前行数+1，否则返回当前行数
    return nbrOfBackticks % 2 === 0 ? currentLineNum + 1 : selectionLine + 1;
  }
  locOpenedClosedElementOccurrences(
    loc: string,
    bracketType: BracketType,
  ): { openedElementOccurrences: number; closedElementOccurrences: number } {
    // 声明变量，用于记录打开和关闭的元素次数
    let openedElementOccurrences = 0;
    let closedElementOccurrences = 0;
    // 根据括号类型，声明正则表达式，用于匹配打开和关闭的元素
    const openedElement: RegExp = bracketType === BracketType.PARENTHESIS ? /\(/g : /{/g;
    const closedElement: RegExp = bracketType === BracketType.PARENTHESIS ? /\)/g : /}/g;
    // 循环匹配打开的元素
    while (openedElement.exec(loc)) {
      openedElementOccurrences++;
    }
    // 循环匹配关闭的元素
    while (closedElement.exec(loc)) {
      closedElementOccurrences++;
    }
    // 返回打开和关闭的元素次数
    return {
      openedElementOccurrences,
      closedElementOccurrences,
    };
  }
  closingElementLine(document: TextDocument, lineNum: number, bracketType: BracketType): number {
    // 获取文档行数
    const docNbrOfLines: number = document.lineCount;
    // 声明一个变量，用来标记是否找到闭合元素
    let closingElementFound = false;
    // 声明一个变量，用来记录打开的元素次数
    let openedElementOccurrences = 0;
    // 声明一个变量，用来记录关闭的元素次数
    let closedElementOccurrences = 0;
    // 当没有找到闭合元素，且当前行数小于文档行数减1时，循环查找
    while (!closingElementFound && lineNum < docNbrOfLines - 1) {
      // 获取当前行文本
      const currentLineText: string = document.lineAt(lineNum).text;
      // 获取当前行中，打开和关闭元素的数量
      const openedClosedElementOccurrences = this.locOpenedClosedElementOccurrences(
        currentLineText,
        bracketType,
      );
      // 打开元素次数加当前行中打开元素的数量
      openedElementOccurrences += openedClosedElementOccurrences.openedElementOccurrences;
      // 关闭元素次数加当前行中关闭元素的数量
      closedElementOccurrences += openedClosedElementOccurrences.closedElementOccurrences;
      // 如果打开元素次数等于关闭元素次数，则找到闭合元素
      if (openedElementOccurrences === closedElementOccurrences) {
        closingElementFound = true;
        return lineNum;
      }
      // 当前行数加1
      lineNum++;
    }
    // 返回当前行数
    return lineNum;
  }
}
