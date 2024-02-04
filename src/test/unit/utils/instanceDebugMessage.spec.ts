import sinon from 'sinon';
import { TextEditor } from 'vscode';
import { describe, expect, it, vi } from 'vitest';
import { GeneralDebugMessage } from '@/debug-message/DebugMessage';
import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

vi.mock('vscode');

describe('instanceDebugMessage', () => {
  it('should return an object with debugMessage property', () => {
    const fakeEditor = {
      document: {
        languageId: '',
      },
    } as unknown as TextEditor;
    const languageId = 'javascript';
    sinon.stub(fakeEditor.document, 'languageId').value(languageId);
    const processor = new GeneralLanguageProcessor(languageId);
    const debugMessage = new GeneralDebugMessage(processor);

    const result = instanceDebugMessage(fakeEditor);

    expect(result).to.have.property('debugMessage').that.deep.equals(debugMessage);
  });
});
