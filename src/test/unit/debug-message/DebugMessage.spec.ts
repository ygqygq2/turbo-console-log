import { TextDocument, TextEditorEdit } from 'vscode';
import { describe, expect, beforeEach, it, vi } from 'vitest';
import { DebugMessage } from '@/debug-message/DebugMessage';
import { ExtensionProperties, Message } from '@/typings/extension/types';
import { LanguageProcessor } from '@/debug-message/types';

class TestDebugMessage extends DebugMessage {
  insertMessage(
    _textEditor: TextEditorEdit,
    _document: TextDocument,
    _selectedVar: string,
    _lineOfSelectedVar: number,
    _tabSize: number,
    _extensionProperties: ExtensionProperties,
  ): void {
    console.log('insertMessage called');
  }

  detectAll(
    _document: TextDocument,
    _logFunctionByLanguageId: string,
    _logMessagePrefix: string,
    _delimiterInsideMessage: string,
  ): Message[] {
    console.log('detectAll called');
    return [];
  }
}

describe('DebugMessage', () => {
  let debugMessage: TestDebugMessage;

  beforeEach(() => {
    const languageProcessorMock = {
      getSingleLineCommentSymbol: vi.fn().mockReturnValue('//'),
    } as unknown as LanguageProcessor;

    debugMessage = new TestDebugMessage(languageProcessorMock);
  });

  it('should return the correct language processor', () => {
    const languageProcessor = debugMessage.getLanguageProcessor();
    expect(languageProcessor).toBeDefined();
  });

  it('should return the correct single line comment symbol', () => {
    const commentSymbol = debugMessage.getSingleLineCommentSymbol();
    expect(commentSymbol).toBe('//');
  });
});
