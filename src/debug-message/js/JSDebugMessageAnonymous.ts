import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import { BracketType } from '../../entities';
import { LineCodeProcessing } from '../../line-code-processing';
import { spacesBeforeLine, closingContextLine } from '../../utilities';

// 导出JSDebugMessageAnonymous类
export class JSDebugMessageAnonymous {
  // 声明一个LineCodeProcessing类型的变量
  lineCodeProcessing: LineCodeProcessing;
  // 构造函数，传入一个LineCodeProcessing类型的参数
  constructor(lineCodeProcessing: LineCodeProcessing) {
    // 将参数赋值给lineCodeProcessing变量
    this.lineCodeProcessing = lineCodeProcessing;
  }
  // 判断是否是匿名函数上下文
  isAnonymousFunctionContext(
    selectedVar: string,
    selectedVarLineLoc: string,
  ): boolean {
    // 返回一个布尔值
    return (
      // 判断是否是匿名函数
      this.lineCodeProcessing.isAnonymousFunction(selectedVarLineLoc) &&
      // 判断是否是匿名函数的参数
      this.lineCodeProcessing.isArgumentOfAnonymousFunction(
        selectedVarLineLoc,
        selectedVar,
      ) &&
      // 判断是否需要转换匿名函数
      this.lineCodeProcessing.shouldTransformAnonymousFunction(
        selectedVarLineLoc,
      )
    );
  }

 anonymousPropDebuggingMsg(
    // 传入文档对象
    document: TextDocument,
    // 传入文本编辑器对象
    textEditor: TextEditorEdit,
    // 传入tab大小
    tabSize: number,
    // 传入是否在函数结束添加分号
    addSemicolonInTheEnd: boolean,
    // 传入选中的属性行
    selectedPropLine: TextLine,
    // 传入调试信息
    debuggingMsg: string,
  ): void {
    // 获取选中属性行的文本
    const selectedVarPropLoc = selectedPropLine.text;
    // 获取匿名函数左边部分
    const anonymousFunctionLeftPart = selectedVarPropLoc.split('=>')[0].trim();
    // 获取匿名函数右边部分，并去除分号
    const anonymousFunctionRightPart = selectedVarPropLoc
      .split('=>')[1]
      .replace(';', '')
      .trim()
      .replace(/\)\s*;?$/, '');
    // 获取选中属性行前面的空格
    const spacesBeforeSelectedVarLine = spacesBeforeLine(
      document,
      selectedPropLine.lineNumber,
    );
    // 获取插入的行前面的空格
    const spacesBeforeLinesToInsert = `${spacesBeforeSelectedVarLine}${' '.repeat(
      tabSize,
    )}`;
    // 判断是否在函数内部
    const isCalledInsideFunction = /\)\s*;?$/.test(selectedVarPropLoc);
    // 判断下一行是否是其他函数的调用
    const isNextLineCallToOtherFunction = document
      .lineAt(selectedPropLine.lineNumber + 1)
      .text.trim()
      .startsWith('.');
    // 获取匿名函数关闭括号行
    const anonymousFunctionClosedParenthesisLine = closingContextLine(
      document,
      selectedPropLine.lineNumber,
      BracketType.PARENTHESIS,
    );
    // 判断匿名函数是否是多行
    const isReturnBlockMultiLine =
      anonymousFunctionClosedParenthesisLine - selectedPropLine.lineNumber !==
      0;
    // 删除选中属性行
    textEditor.delete(selectedPropLine.rangeIncludingLineBreak);
    // 在选中属性行前面插入匿名函数
    textEditor.insert(
      new Position(selectedPropLine.lineNumber, 0),
      `${spacesBeforeSelectedVarLine}${anonymousFunctionLeftPart} => {\n`,
    );
    // 判断匿名函数是否是多行
    if (isReturnBlockMultiLine) {
      // 在选中属性行前面插入调试信息
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n`,
      );
      // 遍历匿名函数关闭括号行到匿名函数关闭括号行
      let currentLine = document.lineAt(selectedPropLine.lineNumber + 1);
      do {
        // 删除当前行
        textEditor.delete(currentLine.rangeIncludingLineBreak);
        // 判断当前行是否是函数调用
        const addReturnKeyword =
          currentLine.lineNumber === selectedPropLine.lineNumber + 1;
        // 获取当前行前面的空格
        const spacesBeforeCurrentLine = spacesBeforeLine(
          document,
          currentLine.lineNumber,
        );
        // 判断当前行是否是右括号
        if (currentLine.text.trim() === ')') {
          currentLine = document.lineAt(currentLine.lineNumber + 1);
          continue;
        }
        // 判断当前行是否是匿名函数关闭括号行
        if (currentLine.lineNumber === anonymousFunctionClosedParenthesisLine) {
          // 在当前行前面插入return或者tab，并去除右括号
          textEditor.insert(
            new Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : '\t'
            }${currentLine.text.trim().replace(/\)\s*$/, '')}\n`,
          );
        } else {
          // 在当前行前面插入return或者tab
          textEditor.insert(
            new Position(currentLine.lineNumber, 0),
            `${spacesBeforeCurrentLine}${
              addReturnKeyword ? 'return ' : '\t'
            }${currentLine.text.trim()}\n`,
          );
        }
        currentLine = document.lineAt(currentLine.lineNumber + 1);
      } while (
        currentLine.lineNumber <
        anonymousFunctionClosedParenthesisLine + 1
      );
      // 在匿名函数关闭括号行+1行前面插入右括号或者分号
      textEditor.insert(
        new Position(anonymousFunctionClosedParenthesisLine + 1, 0),
        `${spacesBeforeSelectedVarLine}}${
          addSemicolonInTheEnd && !isReturnBlockMultiLine ? ';' : ''
        })\n`,
      );
    } else {
      // 获取下一行文本
      const nextLineText = document.lineAt(
        selectedPropLine.lineNumber + 1,
      ).text;
      // 判断下一行是否是函数结束
      const nextLineIsEndWithinTheMainFunction = /^\)/.test(
        nextLineText.trim(),
      );
      // 在选中属性行前面插入调试信息
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}${debuggingMsg}\n`,
      );
      // 在选中属性行前面插入匿名函数右边部分，并去除分号
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeLinesToInsert}return ${anonymousFunctionRightPart}${
          addSemicolonInTheEnd ? ';' : ''
        }\n`,
      );
      // 在选中属性行前面插入右括号或者分号，并去除换行
      textEditor.insert(
        new Position(selectedPropLine.lineNumber, 0),
        `${spacesBeforeSelectedVarLine}}${isCalledInsideFunction ? ')' : ''}${
          addSemicolonInTheEnd &&
          !isNextLineCallToOtherFunction &&
          !nextLineIsEndWithinTheMainFunction
            ? ';'
            : ''
        }${nextLineText === '' ? '' : '\n'}`,
      );
    }
  }
}
