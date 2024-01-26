import { Position, TextDocument, TextEditorEdit } from 'vscode';
import {
  BracketType,
  ExtensionProperties,
  LogContextMetadata,
  LogMessage,
  Message,
} from '../entities';
import { DebugMessageLine, LanguageProcessor } from './types';
import { closingContextLine } from '@/utilities';
import { omit } from 'lodash';

// 导出抽象类DebugMessage
export abstract class DebugMessage {
  // 行代码处理
  languageProcessor: LanguageProcessor;
  // 调试消息行
  debugMessageLine: DebugMessageLine;
  // 构造函数
  constructor(languageProcessor: LanguageProcessor, debugMessageLine: DebugMessageLine) {
    this.languageProcessor = languageProcessor;
    this.debugMessageLine = debugMessageLine;
  }
  // 返回日志消息
  abstract logMessage(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
  ): LogMessage;
  // 返回消息
  abstract msg(
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
    logFunction: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[];
  // 返回行
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number {
    return this.debugMessageLine.line(document, selectionLine, selectedVar, logMsg);
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
}

export class GeneralDebugMessage extends DebugMessage {
  constructor(languageProcessor: LanguageProcessor, debugMessageLine: DebugMessageLine) {
    super(languageProcessor, debugMessageLine);
  }
  logMessage(document: TextDocument, selectionLine: number, selectedVar: string): LogMessage {}
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
    }${selectedVar}${extensionProperties.logMessageSuffix}${
      extensionProperties.quote
    }, ${selectedVar})${semicolon}`;
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
