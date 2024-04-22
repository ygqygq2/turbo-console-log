import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TextDocument, TextEditorEdit } from 'vscode';

import { DebugMessage } from '@/debug-message/DebugMessage';
import { LanguageProcessor } from '@/debug-message/types';
import { ExtensionProperties, Message } from '@/typings/extension/types';

class TestDebugMessage extends DebugMessage {
  generateAndInsertDebugMessage(
    _textEditor: TextEditorEdit,
    _document: TextDocument,
    _selectedVar: string,
    _lineOfSelectedVar: number,
    _extensionProperties: ExtensionProperties,
  ): void {
    console.log('insertMessage called');
  }

  detectAllDebugLine(
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
