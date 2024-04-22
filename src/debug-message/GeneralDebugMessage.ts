import { omit } from 'lodash';
import { Position, TextDocument, TextEditorEdit } from 'vscode';

import { closingContextLine } from '@/utils/closingContextLine';

import { BracketType, ExtensionProperties, Message } from '../typings';
import { DebugMessage } from './DebugMessage';
import { LanguageProcessor } from './types';

export class GeneralDebugMessage extends DebugMessage {
  // 构造函数
  constructor(languageProcessor: LanguageProcessor) {
    super(languageProcessor);
  }

  // 返回插入行
  public getInsertLine(selectionLine: number): number {
    return selectionLine + 1;
  }

  // 返回消息缩进空格
  public getSpacesBeforeLogMsg(document: TextDocument, selectedVarLine: number, logMsgLine: number): string {
    const selectedVarTextLine = document.lineAt(selectedVarLine);
    const selectedVarTextLineFirstNonWhitespaceCharacterIndex = selectedVarTextLine.firstNonWhitespaceCharacterIndex;
    const spacesBeforeSelectedVarLine = selectedVarTextLine.text
      .split('')
      .splice(0, selectedVarTextLineFirstNonWhitespaceCharacterIndex)
      .reduce((previousValue, currentValue) => previousValue + currentValue, '');
    if (logMsgLine < document.lineCount) {
      const logMsgTextLine = document.lineAt(logMsgLine);
      const logMsgTextLineFirstNonWhitespaceCharacterIndex = logMsgTextLine.firstNonWhitespaceCharacterIndex;
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

  private insertDebugMessage(
    document: TextDocument,
    textEditor: TextEditorEdit,
    lineOfLogMsg: number,
    debugMsgLineContent: string,
    insertEmptyLineBeforeLogMessage: ExtensionProperties['insertEmptyLineBeforeLogMessage'],
    insertEmptyLineAfterLogMessage: ExtensionProperties['insertEmptyLineAfterLogMessage'],
  ): void {
    // 向指定行插入调试信息
    textEditor.insert(
      new Position(lineOfLogMsg >= document.lineCount ? document.lineCount : lineOfLogMsg, 0),
      `${insertEmptyLineBeforeLogMessage ? '\n' : ''}${
        lineOfLogMsg === document.lineCount ? '\n' : ''
      }${debugMsgLineContent}\n${insertEmptyLineAfterLogMessage ? '\n' : ''}`,
    );
  }

  // 构造调试消息
  private generateDebugLineContent(
    extensionProperties: ExtensionProperties,
    debugMsgContent: string,
    spacesBeforeMsg: string,
  ): string {
    const { logMessagePrefix, quote, addSemicolonInTheEnd, wrapLogMessage } = extensionProperties;
    // 构造日志语句
    const logStatement = `${this.getLanguageProcessor()?.getPrintString()}${quote}${logMessagePrefix} ${'-'.repeat(debugMsgContent.length - 16)}${logMessagePrefix}${quote}`;
    // 根据是否需要在末尾添加分号来构造包装消息
    const wrappingMsg = `${logStatement}${addSemicolonInTheEnd ? ';' : ''}`;
    // 根据是否需要包装日志消息来构造调试消息
    const debugMsg: string = wrapLogMessage
      ? `${spacesBeforeMsg}${wrappingMsg}\n${spacesBeforeMsg}${debugMsgContent}\n${spacesBeforeMsg}${wrappingMsg}`
      : `${spacesBeforeMsg}${debugMsgContent}`;

    return debugMsg;
  }

  // 构造调试信息内容
  private generateDebugMessage(
    document: TextDocument,
    selectedVar: string,
    lineOfLogMsg: number,
    extensionProperties: Omit<ExtensionProperties, 'wrapLogMessage' | 'insertEmptyLineAfterLogMessage'>,
  ): string {
    const {
      addSemicolonInTheEnd,
      logMessagePrefix,
      logFunction,
      quote,
      delimiterInsideMessage,
      includeFileNameAndLineNum,
      insertEmptyLineBeforeLogMessage,
      logMessageSuffix,
    } = extensionProperties;

    // 获取文件名
    const fileName = document.fileName.includes('/')
      ? document.fileName.split('/')[document.fileName.split('/').length - 1]
      : document.fileName.split('\\')[document.fileName.split('\\').length - 1];
    // 判断是否添加分号
    const semicolon: string = addSemicolonInTheEnd ? ';' : '';
    // 语言处理器
    const lp = this.getLanguageProcessor();
    // 日志中的行号，如果需要在消息前添加空行，则行号加 2，否则加 1
    lineOfLogMsg = lineOfLogMsg + (insertEmptyLineBeforeLogMessage ? 2 : 1);
    // 获取日志输出函数
    const logFunctionByLanguageId = lp?.getLogFunction(logFunction) || '';
    // 处理 logMessagePrefix
    const prefix =
      logMessagePrefix.length !== 0 && logMessagePrefix !== `${delimiterInsideMessage} `
        ? ` ${delimiterInsideMessage} `
        : '';
    // 处理 fileNameAndLineNum
    const fileNameAndLineNum = includeFileNameAndLineNum
      ? `file: ${fileName}:${lineOfLogMsg} ${delimiterInsideMessage} `
      : '';
    // 处理 Rust 特殊情况
    const extraSpace = lp?.getExtraSpace();
    const concatString = lp?.getConcatenatedString();
    const variable = lp?.variableToString(selectedVar);
    // 构建 content
    const content = `${quote}${logMessagePrefix}${prefix}${fileNameAndLineNum}${selectedVar}${logMessageSuffix}${extraSpace}${quote}${concatString}${variable}`;
    return lp?.getPrintStatement(content, logFunctionByLanguageId, semicolon);
  }

  // 生成调试信息并将其添加到文档中
  public generateAndInsertDebugMessage(
    textEditor: TextEditorEdit,
    document: TextDocument,
    selectedVar: string,
    lineOfSelectedVar: number,
    extensionProperties: ExtensionProperties,
  ): void {
    // 日志插入行
    const lineOfLogMsg: number = this.getInsertLine(lineOfSelectedVar);
    // 日志插入缩进空格
    const spacesBeforeMsg: string = this.getSpacesBeforeLogMsg(document, lineOfSelectedVar, lineOfLogMsg);
    // 生成调试信息内容
    const debugMsgContent: string = this.generateDebugMessage(
      document,
      selectedVar,
      lineOfLogMsg,
      omit(extensionProperties, ['wrapLogMessage', 'insertEmptyLineAfterLogMessage']),
    );
    // 生成调试信息的一行内容，包含空格缩进
    const debugMsgLineContent: string = this.generateDebugLineContent(
      extensionProperties,
      debugMsgContent,
      spacesBeforeMsg,
    );

    // 日志插入文件
    this.insertDebugMessage(
      document,
      textEditor,
      lineOfLogMsg,
      debugMsgLineContent,
      extensionProperties.insertEmptyLineBeforeLogMessage,
      extensionProperties.insertEmptyLineAfterLogMessage,
    );
  }

  protected createRegex(input: string): RegExp {
    return new RegExp(input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // & 代表整个被匹配的字符串
  }

  // 检测文档中的所有消息
  public detectAllDebugLine = (
    document: TextDocument,
    logFunctionByLanguageId: string,
    logMessagePrefix: string,
    delimiterInsideMessage: string,
  ): Message[] => {
    // 获取文档行数
    const documentNbrOfLines: number = document.lineCount;
    // 存储消息的数组
    const logMessages: Message[] = [];
    // 遍历文档
    for (let i = 0; i < documentNbrOfLines; i++) {
      // 创建正则表达式，用于匹配消息函数
      const logFunctionRegExp = this.createRegex(logFunctionByLanguageId);
      // 判断当前行文本是否包含消息函数
      if (logFunctionRegExp.test(document.lineAt(i).text)) {
        // 创建消息对象
        const logMessage: Message = {
          spaces: '',
          lines: [],
        };
        // 获取消息前导空格
        logMessage.spaces = this.getSpacesBeforeLogMsg(document, i, i);
        // 获取关闭括号行号
        const closedParenthesisLine = closingContextLine(document, i, BracketType.PARENTHESIS);
        // 保存多行文本到一起，用于后面匹配
        let msg = '';
        // 遍历当前行到关闭括号行之间的行
        for (let j = i; j <= closedParenthesisLine; j++) {
          // 增加当前行文本
          msg += document.lineAt(j).text;
          // 获取当前行范围
          logMessage.lines.push(document.lineAt(j).rangeIncludingLineBreak);
        }
        // 判断消息前导文本是否包含消息前导文本前缀
        const logMessagePrefixRegExp = this.createRegex(logMessagePrefix);
        const delimiterInsideMessageRegExp = this.createRegex(delimiterInsideMessage);
        if (logMessagePrefixRegExp.test(msg) && delimiterInsideMessageRegExp.test(msg)) {
          // 添加消息到消息数组
          logMessages.push(logMessage);
        }
      }
    }
    // 返回消息数组
    return logMessages;
  };
}
