import { TextDocument, TextEditorEdit } from 'vscode';
import { BlockType, ExtensionProperties, LogMessage, Message } from '../entities';
import { LineCodeProcessing } from '../line-code-processing';
import { DebugMessageLine } from './types';

// 导出抽象类DebugMessage
export abstract class DebugMessage {
  // 行代码处理
  lineCodeProcessing: LineCodeProcessing;
  // 调试消息行
  debugMessageLine: DebugMessageLine;
  // 构造函数
  constructor(lineCodeProcessing: LineCodeProcessing, debugMessageLine: DebugMessageLine) {
    this.lineCodeProcessing = lineCodeProcessing;
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
  // 返回包含选择变量的块名称
  abstract enclosingBlockName(
    document: TextDocument,
    lineOfSelectedVar: number,
    blockType: BlockType,
  ): string;
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
