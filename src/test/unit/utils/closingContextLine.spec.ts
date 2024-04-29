import { describe, expect, it, vi } from 'vitest';
import { TextDocument } from 'vscode';

import { BracketType } from '@/typings/extension/enums';
import { closingContextLine } from '@/utils/closingContextLine';

vi.mock('vscode');
describe('closingContextLine', () => {
  it('should return the declaration line when the number of opening and closing brackets is equal', () => {
    const document = {
      lineCount: 5,
      lineAt: (line: number) => {
        return {
          text: line === 2 ? 'const foo = { bar: { baz: 1 } };' : '',
        };
      },
    } as TextDocument;
    const declarationLine = 2;
    const bracketType = BracketType.CURLY_BRACES;
    const expected = 2;
    const result = closingContextLine(document, declarationLine, bracketType);
    expect(result).to.equal(expected);
  });

  it('should return -1 when the number of opening and closing brackets is not equal', () => {
    const document = {
      lineCount: 5,
      lineAt: (line: number) => {
        return {
          text: line === 2 ? 'const foo = { bar: { baz: 1 };' : '',
        };
      },
    } as TextDocument;
    const declarationLine = 2;
    const bracketType = BracketType.CURLY_BRACES;
    const expected = -1;
    const result = closingContextLine(document, declarationLine, bracketType);
    expect(result).to.equal(expected);
  });

  it('should return -1 when the declaration line is greater than or equal to the document line count', () => {
    const document = {
      lineCount: 5,
      lineAt: (_line: number) => {
        return {
          text: '',
        };
      },
    } as TextDocument;
    const declarationLine = 5;
    const bracketType = BracketType.CURLY_BRACES;
    const expected = -1;
    const result = closingContextLine(document, declarationLine, bracketType);
    expect(result).to.equal(expected);
  });
});
