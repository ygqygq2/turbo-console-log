import { Position, TextDocument, TextEditorEdit } from 'vscode';
import { closingContextLine } from '@/utils';
import { omit } from 'lodash';
import { BracketType, ExtensionProperties, Message } from '../typings';
import { LanguageProcessorUnion } from './LanguageProcessor';

// 导出抽象类DebugMessage
export abstract class DebugMessage {
  // 行代码处理
  languageProcessor: LanguageProcessorUnion;
  // 构造函数
  constructor(languageProcessor: LanguageProcessorUnion) {
    this.languageProcessor = languageProcessor;
  }

  // 返回消息
  abstract insertMessage(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void;

  // 检测消息
  abstract detectAll(
    document: TextDocument,
    logFunctionByLanguageId: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[];

  // 返回行
  line(selectionLine: number): number {
    return selectionLine + 1;
  }

  // 返回消息前导空格
  spacesBeforeLogMsg(document: TextDocument, selectedVarLine: number, logMsgLine: number): string {
    const selectedVarTextLine = document.lineAt(selectedVarLine);
    const selectedVarTextLineFirstNonWhitespaceCharacterIndex =
      selectedVarTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVarLine = selectedVarTextLine.text
      .split('')
      .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
      .reduce((previousValue, currentValue) => previousValue + currentValue, '');
    if (logMsgLine < document.lineCount) {
      const logMsgTextLine = document.lineAt(logMsgLine);
      const logMsgTextLineFirstNonWhitespaceCharacterIndex =
        logMsgTextLine.firstNonWhitespaceCharacterIndex;
      const spacesBeforeLogMsgLine = logMsgTextLine.text
        .split('')
        .splice(0, logMsgTextLineFirstNonWhitespaceCharacterIndex)
        .reduce((previousValue, currentValue) => previousValue + currentValue, '');
      return spacesBeforeSelectedVarLine.length > spacesBeforeLogMsgLine.length
        ? spacesBeforeSelectedVarLine
        : spacesBeforeLogMsgLine;
    }
    return spacesBeforeSelectedVarLine;
  }

  // 获取注释符号
  getSingleLineCommentSymbol(): string {
    return this.languageProcessor.getSingleLineCommentSymbol();
  }
}

export class GeneralDebugMessage extends DebugMessage {
  constructor(languageProcessor: LanguageProcessorUnion) {
    super(languageProcessor);
  }
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

  // 构造调试消息
  private constructDebuggingMsg(
    extensionProperties: ExtensionProperties,
    debuggingMsgContent: string,
    spacesBeforeMsg: string,
  ): string {
    const { logMessagePrefix, quote, addSemicolonInTheEnd, wrapLogMessage } = extensionProperties;
    const logStatement = `${this.languageProcessor.getPrintString()}${quote}${logMessagePrefix} ${'-'.repeat(debuggingMsgContent.length - 16)}${logMessagePrefix}${quote}`;
    const wrappingMsg = `${logStatement}${addSemicolonInTheEnd ? ';' : ''}`;
    const debuggingMsg: string = wrapLogMessage
      ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debuggingMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
      : `${spacesBeforeMsg}${debuggingMsgContent}`;
    return debuggingMsg;
  }

  // 构造调试信息内容
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
    // 判断是否添加分号
    const semicolon: string = extensionProperties.addSemicolonInTheEnd ? ';' : '';
    // 构建调试信息
    lineOfLogMsg + (extensionProperties.insertEmptyLineBeforeLogMessage ? 2 : 1);
    const {
      logMessagePrefix,
      logFunction,
      quote,
      delimiterInsideMessage,
      includeFileNameAndLineNum,
      insertEmptyLineBeforeLogMessage,
      logMessageSuffix,
    } = extensionProperties;
    const logFunctionByLanguageId = this.languageProcessor.getLogFunction(logFunction);
    const content = `${quote}${logMessagePrefix}${
      logMessagePrefix.length !== 0 && logMessagePrefix !== `${delimiterInsideMessage} `
        ? ` ${delimiterInsideMessage} `
        : ''
    }${
      includeFileNameAndLineNum
        ? `file: ${fileName}:${
            lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1)
          } ${delimiterInsideMessage} `
        : ''
    }${selectedVar}${logMessageSuffix}${quote}${this.languageProcessor.getConcatenatedString()} ${this.languageProcessor.variableToString(selectedVar)}`;
    if (!logFunctionByLanguageId) {
      return this.languageProcessor.getPrintStatement(content, semicolon);
    }
    return `${logFunctionByLanguageId}(${content})${semicolon}`;
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
  insertMessage(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    tabSize: number,
    extensionProperties: ExtensionProperties,
  ): void {
    const lineOfLogMsg: number = this.line(lineOfSelectedVar);
    const spacesBeforeMsg: string = this.spacesBeforeLogMsg(
      document,
      lineOfSelectedVar,
      lineOfLogMsg,
    );
    // 构造调试信息内容
    const debuggingMsgContent: string = this.constructDebuggingMsgContent(
      document,
      selectedVar,
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
    // const selectedVarLine = document.lineAt(lineOfSelectedVar);
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

  // 检测文档中的所有消息
  detectAll(
    document: TextDocument,
    logFunctionByLanguageId: string,
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
      const turboConsoleLogMessage = new RegExp(
        logFunctionByLanguageId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      );
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
          new RegExp(logMessagePrefix).test(msg) &&
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
