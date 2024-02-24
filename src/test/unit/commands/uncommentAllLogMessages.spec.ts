import {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  window,
} from 'vscode';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { uncommentAllLogMessagesCommand } from '@/commands/uncommentAllLogMessages';
import { ExtensionProperties } from '@/typings';

vi.mock('vscode');

describe('uncommentAllLogMessagesCommand', () => {
  let mockEditor: TextEditor | undefined;
  let mockDocument: TextDocument;
  let mockSelection: Selection;
  let mockSelections: Selection[];
  let mockEditBuilder: TextEditorEdit;
  let mockExtensionProperties: ExtensionProperties;

  beforeEach(() => {
    mockExtensionProperties = {
      wrapLogMessage: false,
      logMessagePrefix: '🚀',
      logMessageSuffix: ':',
      addSemicolonInTheEnd: true,
      insertEmptyLineBeforeLogMessage: false,
      insertEmptyLineAfterLogMessage: false,
      quote: '"',
      delimiterInsideMessage: '~',
      includeFileNameAndLineNum: true,
      logFunction: {},
    };

    mockDocument = {
      getWordRangeAtPosition: vi
        .fn()
        .mockReturnValue(new Range(new Position(0, 0), new Position(0, 0)))
        .mockReturnValueOnce(new Range(new Position(0, 0), new Position(0, 4))),
      getText: vi.fn((range: Range): string => {
        if (range.isEmpty) {
          return ''; // 未选中字符串，返回空字符串
        }
        return 'myVar';
      }),
      lineAt: vi.fn().mockImplementation((lineNumber) => {
        if (lineNumber === 2) {
          return {
            text: 'console.log("🚀 ~ file: test.js:2 ~ a:", a)', // 模拟行的文本内容
            firstNonWhitespaceCharacterIndex: 0, // 模拟行的第一个非空格字符的索引
            range: {
              start: { line: lineNumber - 1, character: 0 }, // 模拟行的起始位置
              end: { line: lineNumber, character: 0 }, // 模拟行的结束位置
            },
            rangeIncludingLineBreak: {
              start: { line: lineNumber - 1, character: 0 },
              end: { line: lineNumber, character: 0 },
            },
          };
        }
        return {
          text: '', // 模拟行的文本内容
          firstNonWhitespaceCharacterIndex: 0, // 模拟行的第一个非空格字符的索引
          range: {
            start: { line: lineNumber - 1, character: 0 }, // 模拟行的起始位置
            end: { line: lineNumber, character: 0 }, // 模拟行的结束位置
          },
        };
      }),
      lineCount: 10, // 模拟文档的行数
      fileName: 'test.js',
    } as unknown as TextDocument;

    mockSelection = new Selection(new Position(0, 0), new Position(0, 4));
    mockSelections = [mockSelection];

    mockEditBuilder = {
      insert: vi.fn(),
      delete: vi.fn(),
    } as unknown as TextEditorEdit;

    mockEditor = {
      document: mockDocument,
      selections: mockSelections,
      edit: vi.fn((callback) => {
        callback(mockEditBuilder);
        return Promise.resolve(true); // 返回一个解析为 true 的 Promise
      }),
      options: { tabSize: 2 },
    } as unknown as TextEditor;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该直接返回，当没有调试日志时', async () => {
    const mockLineAt = vi.fn().mockImplementation((lineNumber) => {
      if (lineNumber === 2) {
        return {
          text: 'mock text', // 模拟行的文本内容
          firstNonWhitespaceCharacterIndex: 0, // 模拟行的第一个非空格字符的索引
          range: {
            start: { line: lineNumber - 1, character: 0 }, // 模拟行的起始位置
            end: { line: lineNumber, character: 0 }, // 模拟行的结束位置
          },
          rangeIncludingLineBreak: {
            start: { line: lineNumber - 1, character: 0 },
            end: { line: lineNumber, character: 0 },
          },
        };
      }
      return {
        text: '', // 模拟行的文本内容
        firstNonWhitespaceCharacterIndex: 0, // 模拟行的第一个非空格字符的索引
        range: {
          start: { line: lineNumber - 1, character: 0 }, // 模拟行的起始位置
          end: { line: lineNumber, character: 0 }, // 模拟行的结束位置
        },
      };
    });
    window.activeTextEditor = {
      ...mockEditor,
      document: {
        ...mockDocument,
        lineAt: mockLineAt,
      },
    } as unknown as TextEditor;
    await uncommentAllLogMessagesCommand().handler(mockExtensionProperties);
    expect(mockEditBuilder!.delete).not.toHaveBeenCalled();
    expect(mockEditBuilder!.insert).not.toHaveBeenCalled();
  });

  it('应该删除调试日志，再插入一行有注释的调试日志，当有调试日志时', async () => {
    window.activeTextEditor = mockEditor;
    await uncommentAllLogMessagesCommand().handler(mockExtensionProperties);
    expect(mockEditBuilder!.delete).toHaveBeenCalledTimes(1);
    expect(mockEditBuilder!.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });
});
