import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Position, Range, TextDocument, TextEditorEdit } from 'vscode';

import { GeneralDebugMessage } from '@/debug-message/GeneralDebugMessage';
import { LanguageProcessor } from '@/debug-message/types';
import { ExtensionProperties } from '@/typings';

vi.mock('vscode');

describe('DebugMessage', () => {
  let languageProcessor: LanguageProcessor;
  let debugMessage: GeneralDebugMessage;

  afterEach(() => {
    vi.resetAllMocks();
  });

  beforeEach(() => {
    languageProcessor = {
      getLanguageId: vi.fn().mockReturnValue('javascript'),
      getSingleLineCommentSymbol: vi.fn().mockReturnValue('//'),
      getPrintString: vi.fn().mockReturnValue('console.log'),
      variableToString: vi.fn().mockReturnValue('value'),
      getConcatenatedString: vi.fn().mockReturnValue(', '),
      getPrintStatement: vi.fn().mockReturnValue(`console.log('🚀 ~ test.js: 6 ~ value:', value);`),
      getLogFunction: vi.fn().mockReturnValue('log'),
    };
    debugMessage = new GeneralDebugMessage(languageProcessor);
  });

  describe('insertMessage', () => {
    let textEditor: TextEditorEdit;
    let document: TextDocument;
    let selectedVar: string;
    let lineOfSelectedVar: number;
    let extensionProperties: ExtensionProperties;

    beforeEach(() => {
      textEditor = {
        insert: vi.fn(),
      } as unknown as TextEditorEdit;
      document = {
        fileName: 'test.js',
        lineAt: vi.fn().mockReturnValue({
          firstNonWhitespaceCharacterIndex: 0,
          text: '',
        }),
        lineCount: 10,
      } as unknown as TextDocument;
      selectedVar = 'value';
      lineOfSelectedVar = 5;
      extensionProperties = {
        logMessagePrefix: '🚀',
        quote: "'",
        addSemicolonInTheEnd: true,
        wrapLogMessage: false,
        logFunction: { javascript: 'console.log' },
        delimiterInsideMessage: '~',
        includeFileNameAndLineNum: true,
        insertEmptyLineBeforeLogMessage: false,
        insertEmptyLineAfterLogMessage: false,
        logMessageSuffix: '',
      };
    });

    it('应该在指定行插入调试日志', () => {
      debugMessage.generateAndInsertDebugMessage(
        textEditor,
        document,
        selectedVar,
        lineOfSelectedVar,
        extensionProperties,
      );

      // 这里增加换行符，不清楚 vscode 是不是默认插入有换行符，本身这里就是 mock
      expect(textEditor.insert).toHaveBeenCalledWith(
        new Position(6, 0),
        `console.log('🚀 ~ test.js: 6 ~ value:', value);\n`,
      );
    });

    // Add more test cases as needed
  });

  describe('detectAll', () => {
    let document: TextDocument;
    let logFunctionByLanguageId: string;
    let logMessagePrefix: string;
    let delimiterInsideMessage: string;

    beforeEach(() => {
      document = {
        fileName: 'test.js',
        languageId: 'javascript',
        lineCount: 10,
        lineAt: vi.fn().mockImplementation((lineIndex: number) => {
          if (lineIndex === 6) {
            return {
              lineNumber: lineIndex,
              text: "console.log('🚀 ~ test.js: 6 ~ value:', value);",
              range: new Range(lineIndex, 0, lineIndex, 42), // Replace 42 with the actual line length
              rangeIncludingLineBreak: new Range(lineIndex, 0, lineIndex, 42), // Replace 42 with the actual line length
            };
          }
          // For other line indexes, return empty values
          return {
            lineNumber: lineIndex,
            text: '',
            range: new Range(lineIndex, 0, lineIndex, 0),
            rangeIncludingLineBreak: new Range(lineIndex, 0, lineIndex, 0),
          };
        }),
      } as unknown as TextDocument;
      logFunctionByLanguageId = 'console.log';
      logMessagePrefix = '🚀';
      delimiterInsideMessage = '~';
    });

    it('应该返回插入的调试日志数组信息', () => {
      const result = debugMessage.detectAllDebugLine(
        document,
        logFunctionByLanguageId,
        logMessagePrefix,
        delimiterInsideMessage,
      );

      expect(result).toEqual([
        {
          spaces: '',
          lines: [new Range(new Position(6, 0), new Position(6, 42))],
        },
      ]);
    });

    // Add more test cases as needed
  });
});
