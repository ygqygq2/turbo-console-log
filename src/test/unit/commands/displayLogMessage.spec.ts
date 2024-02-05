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
import { displayLogMessageCommand } from '@/commands/displayLogMessage';
import { ExtensionProperties } from '@/typings';

vi.mock('vscode');

describe('displayLogMessageCommand', () => {
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
        const { start, end } = range;
        if (start.isEqual(end)) {
          return ''; // 未选中字符串，返回空字符串
        }
        return 'myVar';
      }),
      lineAt: vi.fn((lineNumber) => {
        return {
          text: 'myVar', // 模拟行的文本内容
          firstNonWhitespaceCharacterIndex: 0, // 模拟行的第一个非空格字符的索引
          range: {
            start: { line: lineNumber, character: 0 }, // 模拟行的起始位置
            end: { line: lineNumber, character: 10 }, // 模拟行的结束位置
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

  it('应该直接返回，当没有活动编辑器时', async () => {
    window.activeTextEditor = undefined;
    await displayLogMessageCommand().handler(mockExtensionProperties);
    expect(mockEditor!.edit).not.toHaveBeenCalled();
  });

  it('应该返回调用，当选中字符串时', async () => {
    window.activeTextEditor = mockEditor;
    await displayLogMessageCommand().handler(mockExtensionProperties);
    expect(mockEditor!.edit).toHaveBeenCalledTimes(1);
    expect(mockEditor!.edit).toHaveBeenCalledWith(expect.any(Function));

    expect(mockEditBuilder.insert).toHaveBeenCalledTimes(1);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });

  it('应该插入调试日志，未选中，但光标放在变量名上时', async () => {
    const mockSelection = new Selection(new Position(0, 0), new Position(0, 0));
    mockSelections = [mockSelection];
    window.activeTextEditor = {
      ...mockEditor,
      ...{
        ...mockDocument,
        selections: mockSelections,
      },
    } as unknown as TextEditor;

    await displayLogMessageCommand().handler(mockExtensionProperties);
    expect(mockEditor!.edit).toHaveBeenCalledTimes(1);
    expect(mockEditor!.edit).toHaveBeenCalledWith(expect.any(Function));
    expect(mockEditBuilder.insert).toHaveBeenCalledTimes(1);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });

  it('应该直接返回，当没有选中字符时和光标没有在字符串旁边时', async () => {
    mockSelections = [];
    window.activeTextEditor = {
      ...mockEditor,
      ...{
        ...mockDocument,
        selections: mockSelections,
      },
    } as unknown as TextEditor;

    await displayLogMessageCommand().handler(mockExtensionProperties);
    expect(mockEditor!.edit).not.toHaveBeenCalled();
  });
});
