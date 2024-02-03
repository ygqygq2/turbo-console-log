import { expectTypeOf } from 'expect-type';
import { ExtensionProperties } from '@/typings/extension/types';
import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';
import { describe, expect, beforeEach, it } from 'vitest';

describe('GeneralLanguageProcessor', () => {
  let languageProcessor: GeneralLanguageProcessor;
  const languageId = 'javascript';

  beforeEach(() => {
    languageProcessor = new GeneralLanguageProcessor(languageId);
  });

  it('应该返回正确的 log 函数', () => {
    const logFunction: ExtensionProperties['logFunction'] = {
      javascript: 'console.log',
      python: 'print',
      go: 'fmt.Println',
      java: 'System.out.println',
      php: 'echo',
      ruby: 'puts',
      swift: 'print',
      csharp: 'Console.WriteLine',
      shellscript: 'echo',
      perl: 'print',
    };

    const result = languageProcessor.getLogFunction(logFunction);
    expectTypeOf<string>(result);
    expect(result).toBe('console.log');
  });

  it('应该返回正确的打印字符串函数名', () => {
    const result = languageProcessor.getPrintString();
    expectTypeOf<string>(result);
    expect(result).toBe('console.log');
  });

  describe('getPrintStatement', () => {
    const func = (variableName: string, logFunctionByLanguageId: string, semicolon: string) => {
      it(`应该返回正确的打印语句，参数[${variableName}, ${logFunctionByLanguageId || 'console.log'}, ${semicolon}]`, () => {
        const expectedResult = `${logFunctionByLanguageId || 'console.log'}(${variableName})${semicolon}`;
        const result = languageProcessor.getPrintStatement(
          variableName,
          logFunctionByLanguageId,
          semicolon,
        );
        expect(result).toBe(expectedResult);
      });
    };

    const arr = [
      { variableName: 'message', logFunctionByLanguageId: '', semicolon: '' },
      { variableName: 'message', logFunctionByLanguageId: '', semicolon: ';' },
      { variableName: 'message', logFunctionByLanguageId: 'print', semicolon: '' },
      { variableName: 'message', logFunctionByLanguageId: 'print', semicolon: ';' },
      { variableName: 'message1', logFunctionByLanguageId: 'print', semicolon: ';' },
    ];
    for (const item of arr) {
      func(item.variableName, item.logFunctionByLanguageId, item.semicolon);
    }
  });

  it('应该返回正确的单注释符', () => {
    const result = languageProcessor.getSingleLineCommentSymbol();
    expectTypeOf<string>(result);
    expect(result).toBe('//');
  });

  it('应该返回正确的字符串和变量连字符号', () => {
    const result = languageProcessor.getConcatenatedString();
    expectTypeOf<string>(result);
    expect(result).toBe(', ');
  });

  it('应该返回正确的变量表示方法', () => {
    const variableName = 'message';
    const expectedResult = 'message';

    const result = languageProcessor.variableToString(variableName);
    expectTypeOf<string>(result);
    expect(result).toBe(expectedResult);
  });
});
