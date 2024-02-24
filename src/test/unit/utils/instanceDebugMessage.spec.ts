import { TextEditor } from 'vscode';
import { describe, expect, it, vi } from 'vitest';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

vi.mock('vscode');

describe('instanceDebugMessage', () => {
  it('should return an object with debugMessage property', () => {
    const mockEditor = {
      document: {
        languageId: 'javascript',
      },
    } as unknown as TextEditor;
    const result = instanceDebugMessage(mockEditor);
    expect(result).toHaveProperty('debugMessage');
  });
});
