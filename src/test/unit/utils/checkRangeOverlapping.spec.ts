import { describe, expect, it, vi } from 'vitest';
import { Position, Range, TextEditor } from 'vscode';

import { Message } from '@/typings/extension/types';
import { checkRangeOverlapping } from '@/utils/checkRangeOverlapping';

const mockPosition = (line: number, character: number) =>
  ({
    line,
    character,
    isBefore: () => true,
    isBeforeOrEqual: () => true,
    isAfter: () => true,
    isAfterOrEqual: () => true,
    isEqual: () => true,
    translate: () => this,
    with: () => this,
    compareTo: () => 1,
  }) as unknown as Position;

const mockRange = (startLine: number, startChar: number, endLine: number, endChar: number) =>
  ({
    start: mockPosition(startLine, startChar),
    end: mockPosition(endLine, endChar),
    intersection: function (this: { start: Position; end: Position }, range: Range): Range | undefined {
      if (!range || !range.start || !range.end) {
        return undefined; // 如果 range 不存在或无效，返回 undefined
      }

      const startLine = Math.max(this.start.line, range.start.line);
      const startChar = Math.max(this.start.character, range.start.character);
      const endLine = Math.min(this.end.line, range.end.line);
      const endChar = Math.min(this.end.character, range.end.character);

      // 如果交集范围无效，返回 undefined
      if (startLine > endLine || (startLine === endLine && startChar > endChar)) {
        return undefined;
      }

      return {
        start: mockPosition(startLine, startChar),
        end: mockPosition(endLine, endChar),
      } as Range; // 返回交集范围
    },
  }) as unknown as Range;

vi.mock('vscode');

describe('checkRangeOverlapping', () => {
  it('should return true if there are overlapping messages', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [mockRange(1, 0, 3, 0)] },
      { spaces: '', lines: [mockRange(2, 0, 4, 0)] },
    ];
    const editor = {
      selections: [mockRange(2, 0, 3, 0)],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.true;
  });

  it('should return false if there are no overlapping messages', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [mockRange(1, 0, 3, 0)] },
      { spaces: '', lines: [mockRange(4, 0, 6, 0)] },
    ];
    const editor = {
      selections: [{ start: mockPosition(7, 0), end: mockPosition(8, 0) }],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });

  it('should handle empty logMessages array', () => {
    const logMessages: Message[] = [];
    const editor = {
      selections: [mockRange(2, 0, 3, 0)],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });

  it('should handle empty editor selections array', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [mockRange(1, 0, 3, 0)] },
      { spaces: '', lines: [mockRange(4, 0, 6, 0)] },
    ];
    const editor = {
      selections: [],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });
});
