import { getTabSize } from '@/utils';
import { expectTypeOf } from 'expect-type';
import { describe, expect, it } from 'vitest';

describe('getTabSize', () => {
  it('should return 4 if tabSize is not provided', () => {
    const result = getTabSize(undefined);
    expect(result).toEqual(4);
  });

  it('should convert tabSize from string to number if provided as string', () => {
    const result = getTabSize('2');
    expect(result).toEqual(2);
  });

  it('should return tabSize as is if provided as number', () => {
    const result = getTabSize(8);
    expect(result).toEqual(8);
  });

  it('should have the correct type signature', () => {
    expectTypeOf<number>(getTabSize(undefined));
    expectTypeOf<number>(getTabSize('2'));
    expectTypeOf<number>(getTabSize(8));
  });
});
