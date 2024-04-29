import { describe, expect, it } from 'vitest';

import { BracketType } from '@/typings/extension/enums';
import { LogBracket } from '@/typings/extension/types';
import { locBrackets } from '@/utils/locBrackets';

describe('locBrackets', () => {
  it('should count opening and closing brackets correctly for parentheses', () => {
    const loc = '(a + b) * (c - d)';
    const bracketType = BracketType.PARENTHESIS;
    const expected: LogBracket = {
      openingBrackets: 2,
      closingBrackets: 2,
    };
    const result = locBrackets(loc, bracketType);
    expect(result).to.deep.equal(expected);
  });

  it('should count opening and closing brackets correctly for curly braces', () => {
    const loc = '{ a: 1, b: 2 }';
    const bracketType = BracketType.CURLY_BRACES;
    const expected: LogBracket = {
      openingBrackets: 1,
      closingBrackets: 1,
    };
    const result = locBrackets(loc, bracketType);
    expect(result).to.deep.equal(expected);
  });

  it('should count opening and closing brackets correctly for empty string', () => {
    const loc = '';
    const bracketType = BracketType.PARENTHESIS;
    const expected: LogBracket = {
      openingBrackets: 0,
      closingBrackets: 0,
    };
    const result = locBrackets(loc, bracketType);
    expect(result).to.deep.equal(expected);
  });
});
