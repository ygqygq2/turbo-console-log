import { Position, TextDocument, TextEditorEdit, TextLine } from 'vscode';
import {
  BlockType,
  ExtensionProperties,
  BracketType,
  LogMessageType,
  Message,
  LogMessage,
  MultilineContextVariable,
} from '../../entities';
import { LineCodeProcessing } from '../../line-code-processing';
import _, { omit } from 'lodash';
import { DebugMessage } from '../DebugMessage';
import { DebugMessageLine } from '../types';
import { getMultiLineContextVariable, closingContextLine } from '../../utilities';
import { JSDebugMessageAnonymous } from './JSDebugMessageAnonymous';

// 定义一个logMessageTypeVerificationPriority数组，按照优先级排序
const logMessageTypeVerificationPriority = _.sortBy(
  [
    // 数组赋值
    { logMessageType: LogMessageType.ArrayAssignment, priority: 2 },
    // 对象文字
    { logMessageType: LogMessageType.ObjectLiteral, priority: 3 },
    // 对象函数调用赋值
    {
      logMessageType: LogMessageType.ObjectFunctionCallAssignment,
      priority: 4,
    },
    // 命名函数
    { logMessageType: LogMessageType.NamedFunction, priority: 6 },
    // 命名函数赋值
    { logMessageType: LogMessageType.NamedFunctionAssignment, priority: 5 },
    // 多行匿名函数
    { logMessageType: LogMessageType.MultiLineAnonymousFunction, priority: 7 },
    // 多行括号
    { logMessageType: LogMessageType.MultilineParenthesis, priority: 8 },
    // 多行大括号
    { logMessageType: LogMessageType.MultilineBraces, priority: 9 },
    // 基本赋值
    { logMessageType: LogMessageType.PrimitiveAssignment, priority: 10 },
    // 装饰器
    { logMessageType: LogMessageType.Decorator, priority: 0 },
    // 三元运算符
    { logMessageType: LogMessageType.Ternary, priority: 1 },
  ],
  'priority',
);

export class JSDebugMessage extends DebugMessage {
  jsDebugMessageAnonymous: JSDebugMessageAnonymous;
  constructor(lineCodeProcessing: LineCodeProcessing, debugMessageLine: DebugMessageLine) {
    super(lineCodeProcessing, debugMessageLine);
    this.jsDebugMessageAnonymous = new JSDebugMessageAnonymous(lineCodeProcessing);
  }
  /**
   * 基础调试消息处理函数
   * @param document 文本文档
   * @param textEditor 文本编辑器编辑
   * @param lineOfLogMsg 日志消息所在的行数
   * @param debuggingMsg 调试消息
   * @param insertEmptyLineBeforeLogMessage 是否在日志消息前插入空行的扩展属性
   * @param insertEmptyLineAfterLogMessage 是否在日志消息后插入空行的扩展属性
   */
  private baseDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    lineOfLogMsg: number,
    debuggingMsg: string,
    insertEmptyLineBeforeLogMessage: ExtensionProperties['insertEmptyLineBeforeLogMessage'],
    insertEmptyLineAfterLogMessage: ExtensionProperties['insertEmptyLineAfterLogMessage'],
  ): void {
    // 向指定行插入调试信息
    textEditor.insert(
      new Position(lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg, 0),
      `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
        lineOfLogMsg === document.lineCount ? '\n' : ''
      }${debuggingMsg}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
    );
  }
  private isEmptyBlockContext(document: TextDocument, logMessage: LogMessage) {
    // 判断是否是多行括号
    if (logMessage.logMessageType === LogMessageType.MultilineParenthesis) {
      // 获取关闭括号行
      return /\){.*}/.test(
        document
          .lineAt((logMessage.metadata as LogContextMetadata).closingContextLine)
          .text.replace(/\s/g, ''),
      );
    }
    // 判断是否是命名函数
    if (logMessage.logMessageType === LogMessageType.NamedFunction) {
      // 获取函数行
      return /\){.*}/.test(
        document
          .lineAt((logMessage.metadata as NamedFunctionMetadata).line)
          .text.replace(/\s/g, ''),
      );
    }
    return false;
  }
  private constructDebuggingMsg(
    extensionProperties: ExtensionProperties,
    debuggingMsgContent: string,
    spacesBeforeMsg: string,
  ): string {
    // 构造调试消息
    const wrappingMsg = `console.${extensionProperties.logType}(${
      extensionProperties.quote
    }${extensionProperties.logMessagePrefix} ${'-'.repeat(
      debuggingMsgContent.length - 16,
    )}${extensionProperties.logMessagePrefix}${extensionProperties.quote})${
      extensionProperties.addSemicolonInTheEnd ? ';' : ''
    }`;
    const debuggingMsg: string = extensionProperties.wrapLogMessage
      ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
      : `${spacesBeforeMsg}${debuggingMsgContent}`;
    return debuggingMsg;
  }
  private constructDebuggingMsgContent(
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    lineOfLogMsg: number,
    extensionProperties: Omit<
      ExtensionProperties,
      'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'
    >,
  ): string {
    // 获取文件名
    const fileName = document.fileName.includes('/')
      ? document.fileName.split('/')[document.fileName.split('/').length - 1]
      : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
    // 获取包含变量的函数名
    const funcThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'function',
    );
    // 获取包含变量的类名
    const classThatEncloseTheVar: string = this.enclosingBlockName(
      document,
      lineOfSelectedVar,
      'class',
    );
    // 判断是否添加分号
    const semicolon: string = extensionProperties.addSemicolonInTheEnd ? ';' : '';
    // 构建调试信息
    return `${
      extensionProperties.logFunction !== 'log'
        ? extensionProperties.logFunction
        : `console.${extensionProperties.logType}`
    }(${extensionProperties.quote}${extensionProperties.logMessagePrefix}${
      extensionProperties.logMessagePrefix.length !== 0 &&
      extensionProperties.logMessagePrefix !== `${extensionProperties.delimiterInsideMessage} `
        ? ` ${extensionProperties.delimiterInsideMessage} `
        : ''
    }${
      extensionProperties.includeFileNameAndLineNum
        ? `file: ${fileName}:${
            lineOfLogMsg + (extensionProperties.insertEmptyLineBeforeLogMessage ? 2 : 1)
          } ${extensionProperties.delimiterInsideMessage} `
        : ''
    }${
      extensionProperties.insertEnclosingClass
        ? classThatEncloseTheVar.length > 0
          ? `${classThatEncloseTheVar} ${extensionProperties.delimiterInsideMessage} `
          : ``
        : ''
    }${
      extensionProperties.insertEnclosingFunction
        ? funcThatEncloseTheVar.length > 0
          ? `${funcThatEncloseTheVar} ${extensionProperties.delimiterInsideMessage} `
          : ''
        : ''
    }${selectedVar}${extensionProperties.logMessageSuffix}${
      extensionProperties.quote
    }, ${selectedVar})${semicolon}`;
  }

  private emptyBlockDebuggingMsg(
    document: TextDocument,
    textEditor: TextEditorEdit,
    emptyBlockLine: TextLine,
    logMsgLine: number,
    debuggingMsg: string,
    spacesBeforeMsg: string,
  ) {
    // 检查是否是函数调用
    if (/\){.*}/.test(emptyBlockLine.text.replace(/\s/g, ''))) {
      // 获取函数调用之前的文本
      const textBeforeClosedFunctionParenthesis = emptyBlockLine.text.split(')')[0];
      // 删除空行
      textEditor.delete(emptyBlockLine.rangeIncludingLineBreak);
      // 在日志消息行之前添加调试消息
      textEditor.insert(
        new Position(logMsgLine >= document.lineCount ? document.lineCount : logMsgLine, 0),
        `${textBeforeClosedFunctionParenthesis}) {\n${
          logMsgLine === document.lineCount ? '\n' : ''
        }${spacesBeforeMsg}${debuggingMsg}\n${spacesBeforeMsg}}\n`,
      );
      return;
    }
  }
  private deepObjectProperty(
    document: TextDocument,
    line: number,
    path = '',
  ): { path: string; line: number } | null {
    // 获取当前行文本
    const lineText = document.lineAt(line).text;
    // 正则表达式，用于匹配属性名
    const propertyNameRegex = /(\w+):\s*\{/;
    // 匹配属性名
    const propertyNameRegexMatch = propertyNameRegex.exec(lineText);
    if (propertyNameRegexMatch) {
      // 获取多行括号变量
      const multilineBracesVariable: MultilineContextVariable | null = getMultiLineContextVariable(
        document,
        line,
        BracketType.CURLY_BRACES,
      );
      if (multilineBracesVariable) {
        // 递归调用，获取深层对象属性
        return this.deepObjectProperty(
          document,
          multilineBracesVariable.openingContextLine,
          `${propertyNameRegexMatch[1]}.${path}`,
        );
      }
    } else if (
      this.lineCodeProcessing.isObjectLiteralAssignedToVariable(
        `${document.lineAt(line).text}${document.lineAt(line + 1).text})}`,
      )
    ) {
      // 获取对象文字赋值给变量的行
      return {
        path: `${document
          .lineAt(line)
          .text.split('=')[0]
          .replace(/(const|let|var)/, '')
          .trim()}.${path}`,
        line: closingContextLine(document, line, BracketType.CURLY_BRACES),
      };
    }
    return null;
  }

  /**
   * 生成调试信息并将其添加到文档中
   *
   * @param {TextEditorEdit} textEditor - 文本编辑器编辑对象
   * @param {TextDocument} document - 文本文档对象
   * @param {string} selectedVar - 选中的变量
   * @param {number} lineOfSelectedVar - 选中变量所在行号
   * @param {number} tabSize - 制表符大小
   * @param {ExtensionProperties} extensionProperties - 扩展属性
   * @returns {void}
   */
  msg(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void {
    const logMsg: LogMessage = this.logMessage(document, lineOfSelectedVar, selectedVar);
    const lineOfLogMsg: number = this.line(document, lineOfSelectedVar, selectedVar, logMsg);
    const spacesBeforeMsg: string = this.spacesBeforeLogMsg(
      document,
      (logMsg.metadata as LogContextMetadata)?.deepObjectLine
        ? (logMsg.metadata as LogContextMetadata)?.deepObjectLine
        : lineOfSelectedVar,
      lineOfLogMsg,
    );
    // 构造调试信息内容
    const debuggingMsgContent: string = this.constructDebuggingMsgContent(
      document,
      (logMsg.metadata as LogContextMetadata)?.deepObjectPath
        ? (logMsg.metadata as LogContextMetadata)?.deepObjectPath
        : selectedVar,
      lineOfSelectedVar,
      lineOfLogMsg,
      omit(extensionProperties, ['wrapLogMessage', 'insertEmptyLineAfterLogMessage']),
    );
    // 构造调试信息
    const debuggingMsg: string = this.constructDebuggingMsg(
      extensionProperties,
      debuggingMsgContent,
      spacesBeforeMsg,
    );
    // 获取选中变量的行
    const selectedVarLine = document.lineAt(lineOfSelectedVar);
    // 获取选中变量的行内容
    const selectedVarLineLoc = selectedVarLine.text;
    // 判断是否是空块上下文
    if (this.isEmptyBlockContext(document, logMsg)) {
      // 获取空块上下文行
      const emptyBlockLine =
        logMsg.logMessageType === LogMessageType.MultilineParenthesis
          ? document.lineAt((logMsg.metadata as LogContextMetadata).closingContextLine)
          : document.lineAt((logMsg.metadata as NamedFunctionMetadata).line);
      // 添加空块调试信息
      this.emptyBlockDebuggingMsg(
        document,
        textEditor,
        emptyBlockLine,
        lineOfLogMsg,
        debuggingMsgContent,
        spacesBeforeMsg,
      );
      return;
    }
    // 判断是否是匿名函数上下文
    if (this.jsDebugMessageAnonymous.isAnonymousFunctionContext(selectedVar, selectedVarLineLoc)) {
      // 添加匿名函数调试信息
      this.jsDebugMessageAnonymous.anonymousPropDebuggingMsg(
        document,
        textEditor,
        tabSize,
        extensionProperties.addSemicolonInTheEnd,
        selectedVarLine,
        debuggingMsgContent,
      );
      return;
    }
    // 添加基础调试信息
    this.baseDebuggingMsg(
      document,
      textEditor,
      lineOfLogMsg,
      debuggingMsg,
      extensionProperties.insertEmptyLineBeforeLogMessage,
      extensionProperties.insertEmptyLineAfterLogMessage,
    );
  }
  /**
   * @description :
   * @param        {TextDocument} document
   * @param        {number} selectionLine
   * @param        {string} selectedVar
   * @return       {*}
   */
  logMessage(document: TextDocument, selectionLine: number, selectedVar: string): LogMessage {
    // 获取当前行文本
    const currentLineText: string = document.lineAt(selectionLine).text;
    // 获取多行括号变量
    const multilineParenthesisVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.PARENTHESIS,
    );
    // 获取多行花括号变量
    const multilineBracesVariable = getMultiLineContextVariable(
      document,
      selectionLine,
      BracketType.CURLY_BRACES,
    );
    // 检查日志消息类型
    const logMsgTypesChecks: {
      [key in LogMessageType]: () => {
        isChecked: boolean;
        metadata?: Pick<LogMessage, 'metadata'>;
      };
    } = {
      [LogMessageType.ObjectLiteral]: () => {
        // 如果当前行是最后一行，则返回false
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
        }

        // 获取下一行索引
        let nextLineIndex = selectionLine + 1;
        // 获取下一行文本，并去除空格
        let nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');

        // 跳过多行注释
        while (nextLineText.trim().startsWith('//') || nextLineText.trim().startsWith('/*')) {
          if (nextLineText.trim().startsWith('/*')) {
            // Skip lines until the end of the multi-line comment
            while (!nextLineText.trim().endsWith('*/')) {
              nextLineIndex++;
              if (nextLineIndex >= document.lineCount) {
                return {
                  isChecked: false,
                };
              }
              nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');
            }
            // Skip the closing comment character
            nextLineIndex++;
          } else {
            // Skip the closing comment character
            nextLineIndex++;
          }

          if (nextLineIndex >= document.lineCount) {
            return {
              isChecked: false,
            };
          }
          // 获取下一行文本，并去除所有空格
          nextLineText = document.lineAt(nextLineIndex).text.replace(/\s/g, '');
        }

        // 将当前行文本和下一行文本合并
        const combinedText = `${currentLineText}${nextLineText}`;
        // 返回是否是对象文字赋值给变量的结果
        return {
          isChecked: this.lineCodeProcessing.isObjectLiteralAssignedToVariable(combinedText),
        };
      },

      [LogMessageType.Decorator]: () => {
        // 检查当前行文本是否以@开头
        return {
          isChecked: /^@[a-zA-Z0-9]{1,}(.*)[a-zA-Z0-9]{1,}/.test(currentLineText.trim()),
        };
      },
      [LogMessageType.ArrayAssignment]: () => {
        // 检查当前行文本是否是数组赋值
        return {
          isChecked: this.lineCodeProcessing.isArrayAssignedToVariable(
            `${currentLineText}\n${currentLineText}`,
          ),
        };
      },
      [LogMessageType.Ternary]: () => {
        // 检查当前行文本是否是三元表达式
        return {
          isChecked: /`/.test(currentLineText),
        };
      },
      [LogMessageType.MultilineBraces]: () => {
        // 检查当前行文本是否是多行括号
        const isChecked =
          multilineBracesVariable !== null &&
          !this.lineCodeProcessing.isAssignedToVariable(currentLineText) &&
          !this.lineCodeProcessing.isAffectationToVariable(currentLineText);
        // FIXME: No need for multilineBracesVariable !== null since it contribute already in the value of isChecked boolean
        if (isChecked && multilineBracesVariable !== null) {
          const deepObjectProperty = this.deepObjectProperty(
            document,
            multilineBracesVariable?.openingContextLine,
            selectedVar,
          );
          if (deepObjectProperty) {
            const multilineBracesObjectScope = getMultiLineContextVariable(
              document,
              deepObjectProperty.line,
              BracketType.CURLY_BRACES,
            );
            return {
              isChecked: true,
              metadata: {
                openingContextLine: multilineBracesObjectScope?.openingContextLine as number,
                closingContextLine: multilineBracesObjectScope?.closingContextLine as number,
                deepObjectLine: deepObjectProperty.line,
                deepObjectPath: deepObjectProperty.path,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
          return {
            isChecked: true,
            metadata: {
              openingContextLine: multilineBracesVariable?.openingContextLine as number,
              closingContextLine: multilineBracesVariable?.closingContextLine as number,
            } as Pick<LogMessage, 'metadata'>,
          };
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.MultilineParenthesis]: () => {
        // 检查是否检查了多行括号
        const isChecked = multilineParenthesisVariable !== null;
        if (isChecked) {
          // 检查是否是打开括号
          const isOpeningCurlyBraceContext = document
            .lineAt(multilineParenthesisVariable?.closingContextLine as number)
            .text.includes('{');
          const isOpeningParenthesisContext = document.lineAt(selectionLine).text.includes('(');
          if (isOpeningCurlyBraceContext || isOpeningParenthesisContext) {
            // 检查当前行是否被赋值
            if (this.lineCodeProcessing.isAssignedToVariable(currentLineText)) {
              return {
                isChecked: true,
                metadata: {
                  // 获取打开括号行
                  openingContextLine: selectionLine,
                  // 获取关闭括号行
                  closingContextLine: closingContextLine(
                    document,
                    multilineParenthesisVariable?.closingContextLine as number,
                    isOpeningCurlyBraceContext ? BracketType.CURLY_BRACES : BracketType.PARENTHESIS,
                  ),
                } as Pick<LogMessage, 'metadata'>,
              };
            }
            return {
              isChecked: true,
              metadata: {
                // 获取打开括号行
                openingContextLine: multilineParenthesisVariable?.openingContextLine as number,
                // 获取关闭括号行
                closingContextLine: multilineParenthesisVariable?.closingContextLine as number,
              } as Pick<LogMessage, 'metadata'>,
            };
          }
        }
        return {
          isChecked: false,
        };
      },
      [LogMessageType.ObjectFunctionCallAssignment]: () => {
        // 如果当前行和下一行是同一个对象函数调用，并且当前行被赋值，则返回true
        if (document.lineCount === selectionLine + 1) {
          return {
            isChecked: false,
          };
        }
        const nextLineText: string = document.lineAt(selectionLine + 1).text.replace(/\s/g, '');
        return {
          isChecked:
            this.lineCodeProcessing.isObjectFunctionCall(`${currentLineText}\n${nextLineText}`) &&
            this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
      [LogMessageType.NamedFunction]: () => {
        // 检查当前行是否包含命名函数声明
        return {
          isChecked: this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(currentLineText),
          metadata: {
            line: selectionLine,
          } as Pick<LogMessage, 'metadata'>,
        };
      },
      [LogMessageType.NamedFunctionAssignment]: () => {
        // 检查当前行是否是命名函数赋值
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`) &&
            multilineParenthesisVariable === null,
        };
      },
      [LogMessageType.MultiLineAnonymousFunction]: () => {
        // 检查当前行是否是匿名函数赋值
        return {
          isChecked:
            this.lineCodeProcessing.isFunctionAssignedToVariable(`${currentLineText}`) &&
            this.lineCodeProcessing.isAnonymousFunction(currentLineText) &&
            this.lineCodeProcessing.shouldTransformAnonymousFunction(currentLineText),
        };
      },
      [LogMessageType.PrimitiveAssignment]: () => {
        // 检查当前行是否是基本类型赋值
        return {
          isChecked: this.lineCodeProcessing.isAssignedToVariable(currentLineText),
        };
      },
    };

    for (const { logMessageType } of logMessageTypeVerificationPriority) {
      const { isChecked, metadata } =
        logMsgTypesChecks[logMessageType as keyof typeof logMsgTypesChecks]();
      if (logMessageType !== LogMessageType.PrimitiveAssignment && isChecked) {
        return {
          logMessageType,
          metadata,
        };
      }
    }
    return {
      logMessageType: LogMessageType.PrimitiveAssignment,
    };
  }
  // 根据文档、选中变量的行号、块类型，返回块名称
  enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string {
    // 当前行号
    let currentLineNum: number = lineOfSelectedVar;
    // 从当前行号开始，向上遍历文档，直到找到块类型
    while (currentLineNum >= 0) {
      // 获取当前行文本
      const currentLineText: string = document.lineAt(currentLineNum).text;
      // 根据块类型，判断是否是块类型
      switch (blockType) {
        case 'class':
          // 判断当前行文本是否包含类声明
          if (this.lineCodeProcessing.doesContainClassDeclaration(currentLineText)) {
            // 判断当前行号是否在类声明行号和关闭括号行号之间
            if (
              lineOfSelectedVar > currentLineNum &&
              lineOfSelectedVar <
                closingContextLine(document, currentLineNum, BracketType.CURLY_BRACES)
            ) {
              // 返回类名
              return `${this.lineCodeProcessing.getClassName(currentLineText)}`;
            }
          }
          break;
        case 'function':
          // 判断当前行文本是否包含命名函数声明
          if (
            this.lineCodeProcessing.doesContainsNamedFunctionDeclaration(currentLineText) &&
            !this.lineCodeProcessing.doesContainsBuiltInFunction(currentLineText)
          ) {
            // 判断当前行号是否在函数声明行号和关闭括号行号之间
            if (
              lineOfSelectedVar >= currentLineNum &&
              lineOfSelectedVar <
                closingContextLine(document, currentLineNum, BracketType.CURLY_BRACES)
            ) {
              // 判断函数名是否为空
              if (this.lineCodeProcessing.getFunctionName(currentLineText).length !== 0) {
                // 返回函数名
                return `${this.lineCodeProcessing.getFunctionName(currentLineText)}`;
              }
              // 返回空字符串
              return '';
            }
          }
          break;
      }
      // 当前行号减一
      currentLineNum--;
    }
    // 返回空字符串
    return '';
  }
  // 检测文档中的所有消息
  detectAll(
    document: TextDocument,
    logFunction: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[] {
    // 获取文档行数
    const documentNbrOfLines: number = document.lineCount;
    // 存储消息的数组
    const logMessages: Message[] = [];
    // 遍历文档
    for (let i = 0; i < documentNbrOfLines; i++) {
      // 创建正则表达式，用于匹配消息函数
      const turboConsoleLogMessage = new RegExp(logFunction.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      // 判断当前行文本是否包含消息函数
      if (turboConsoleLogMessage.test(document.lineAt(i).text)) {
        // 创建消息对象
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        // 获取消息前导空格
        logMessage.spaces = this.spacesBeforeLogMsg(document, i, i);
        // 获取关闭括号行号
        const closedParenthesisLine = closingContextLine(document, i, BracketType.PARENTHESIS);
        let msg = '';
        // 遍历当前行到关闭括号行之间的行
        for (let j = i; j <= closedParenthesisLine; j++) {
          // 获取当前行文本
          msg += document.lineAt(j).text;
          // 获取当前行范围
          logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        }
        // 判断消息前导文本是否包含消息前导文本前缀
        if (
          new RegExp(logMessagePrefix).test(msg) ||
          new RegExp(delimiterInsideMessage).test(msg)
        ) {
          // 添加消息到消息数组
          logMessages.push(logMessage);
        }
      }
    }
    // 返回消息数组
    return logMessages;
  }
}
