import { TextEditor } from 'vscode';
import { describe, expect, it, vi } from 'vitest';
import { instanceDebugMessage } from '@/utils/instanceDebugMessage';

vi.mock('vscode');

describe('instanceDebugMessage', () => {
  it('应该返回具有 debug Message 属性的对象', () => {
    const mockEditor = {
      document: {
        languageId: 'javascript',
      },
    } as unknown as TextEditor;
    const result = instanceDebugMessage(mockEditor);
    expect(result).toHaveProperty('debugMessage');
  });

  it('应该在编辑器不可用时抛出错误', () => {
    const mockEditor = undefined as unknown as TextEditor;
    expect(() => instanceDebugMessage(mockEditor)).toThrow('No editor available');
  });
});
