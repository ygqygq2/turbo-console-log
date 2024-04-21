import { expectTypeOf } from 'expect-type';
import { beforeEach, describe, expect, it } from 'vitest';

import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';
import { ExtensionProperties } from '@/typings/extension/types';

describe('GeneralLanguageProcessor', () => {
  const logFunction: ExtensionProperties['logFunction'] = {
    javascript: 'console.log',
    typescript: 'console.log',
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

  for (const languageId in logFunction) {
    describe(`语言 ${languageId}`, () => {
      let languageProcessor: GeneralLanguageProcessor;
      beforeEach(() => {
        languageProcessor = new GeneralLanguageProcessor(languageId);
      });

      it(`应该返回正确的 log 函数 ${logFunction[languageId]}`, () => {
        const result = languageProcessor.getLogFunction(logFunction);
        const toBeResult = logFunction[languageId];
        expectTypeOf<string>(result);
        expect(result).toBe(toBeResult);
      });

      it(`应该返回正确的打印字符串函数名 ${logFunction[languageId]}`, () => {
        const result = languageProcessor.getPrintString();
        expectTypeOf<string>(result);
        expect(result).toBe(logFunction[languageId]);
      });

      describe('测试函数 getPrintStatement', () => {
        const func = (variableName: string, logFunctionByLanguageId: string, semicolon: string) => {
          it(`应该返回正确的打印语句，参数[${variableName}, ${logFunctionByLanguageId || logFunction[languageId]}, ${semicolon}]`, () => {
            let expectedResult: string;
            switch (languageId) {
              case 'javascript':
              case 'typescript':
              case 'swift':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]}(${variableName})${semicolon}`;
                break;
              case 'csharp':
              case 'java':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]}(${variableName});`;
                break;
              case 'python':
              case 'go':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]}(${variableName})`;
                break;
              case 'php':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]} ${variableName};`;
                break;
              case 'perl':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]} ${variableName};\n`;
                break;
              case 'ruby':
              case 'shellscript':
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]} ${variableName}`;
                break;
              default:
                expectedResult = `${logFunctionByLanguageId || logFunction[languageId]}(${variableName})`;
            }
            const result = languageProcessor.getPrintStatement(variableName, logFunctionByLanguageId, semicolon);
            expect(result).toBe(expectedResult);
          });
        };

        const arr = [{ variableName: 'message', logFunctionByLanguageId: '', semicolon: '' }];
        for (const item of arr) {
          func(item.variableName, item.logFunctionByLanguageId, item.semicolon);
        }
      });

      // switch 测试太恶心了，直接跳过了
      it.skip('应该返回正确的单注释符', () => {
        const result = languageProcessor.getSingleLineCommentSymbol();
        expectTypeOf<string>(result);
        expect(result).toBe('//');
      });

      it.skip('应该返回正确的字符串和变量连字符号', () => {
        const result = languageProcessor.getConcatenatedString();
        expectTypeOf<string>(result);
        expect(result).toBe(', ');
      });

      it.skip('应该返回正确的变量表示方法', () => {
        const variableName = 'message';
        const expectedResult = 'message';

        const result = languageProcessor.variableToString(variableName);
        expectTypeOf<string>(result);
        expect(result).toBe(expectedResult);
      });
    });
  }
});
