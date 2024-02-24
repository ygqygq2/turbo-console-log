import { TextDocument, TextEditorEdit } from 'vscode';
import { ExtensionProperties, Message } from '../typings';
import { LanguageProcessor } from './types';

// 导出抽象类DebugMessage
export abstract class DebugMessage {
  // 行代码处理
  private languageProcessor: LanguageProcessor;
  // 构造函数
  constructor(languageProcessor: LanguageProcessor) {
    this.languageProcessor = languageProcessor;
  }

  public getLanguageProcessor(): LanguageProcessor {
    return this.languageProcessor;
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

  // 获取注释符号
  public getSingleLineCommentSymbol(): string {
    return this.languageProcessor.getSingleLineCommentSymbol();
  }
}
