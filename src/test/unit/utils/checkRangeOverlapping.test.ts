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

vi.mock('vscode');

describe('checkRangeOverlapping', () => {
  it('should return true if there are overlapping messages', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [{ start: mockPosition(1, 0), end: mockPosition(3, 0) }] as unknown as Range[] },
      { spaces: '', lines: [{ start: mockPosition(2, 0), end: mockPosition(4, 0) }] as unknown as Range[] },
    ];
    const editor = {
      selections: [{ start: mockPosition(2, 0), end: mockPosition(3, 0) }],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.true;
  });

  it('should return false if there are no overlapping messages', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [{ start: mockPosition(1, 0), end: mockPosition(3, 0) }] as unknown as Range[] },
      { spaces: '', lines: [{ start: mockPosition(4, 0), end: mockPosition(6, 0) }] as unknown as Range[] },
    ];
    const editor = {
      selections: [{ start: mockPosition(5, 0), end: mockPosition(7, 0) }],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });

  it('should handle empty logMessages array', () => {
    const logMessages: Message[] = [];
    const editor = {
      selections: [{ start: mockPosition(2, 0), end: mockPosition(3, 0) }],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });

  it('should handle empty editor selections array', () => {
    const logMessages: Message[] = [
      { spaces: '', lines: [{ start: mockPosition(1, 0), end: mockPosition(3, 0) }] as unknown as Range[] },
      { spaces: '', lines: [{ start: mockPosition(4, 0), end: mockPosition(6, 0) }] as unknown as Range[] },
    ];
    const editor = {
      selections: [],
    } as unknown as TextEditor;
    const result = checkRangeOverlapping(logMessages, editor);
    expect(result).to.be.false;
  });
});
