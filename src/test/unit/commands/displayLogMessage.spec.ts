import {
  Position,
  Range,
  Selection,
  TextDocument,
  TextEditor,
  TextEditorEdit,
  window,
} from 'vscode';
import { describe, expect, it, vi } from 'vitest';
import { displayLogMessageCommand } from '@/commands/displayLogMessage';
import { GeneralDebugMessage } from '@/debug-message';
import { ExtensionProperties } from '@/typings';

vi.mock('vscode');

describe.todo('displayLogMessageCommand', () => {
  let mockEditor: TextEditor | undefined;
  let mockDocument: TextDocument;
  let mockSelections: Selection[];
  let mockEditBuilder: TextEditorEdit;
  let mockRange: Range;
  let mockDebugMessage: GeneralDebugMessage;
  let mockExtensionProperties: ExtensionProperties;
  let getTabSizeStub: () => number;

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
    mockEditor = {
      document: {
        getWordRangeAtPosition: vi.fn(),
        getText: vi.fn(),
      },
      selections: [],
      edit: vi.fn((callback) => {
        callback(mockEditBuilder);
      }),
    };

    mockSelections = [
      new Selection(new Position(0, 0), new Position(0, 5)),
      new Selection(new Position(1, 0), new Position(1, 10)),
    ];

    mockDocument = {
      getWordRangeAtPosition: vi.fn(),
      getText: vi.fn(),
    };

    mockEditBuilder = {
      insert: vi.fn(),
    };
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('应该直接返回，当没有活动编辑器时', async () => {
    window.activeTextEditor = undefined;
    await displayLogMessageCommand().handler(mockExtensionProperties);
    expect(mockEditor!.edit).not.toHaveBeenCalled();
  });

  it('应该返回调用，当选中字符串时', async () => {
    window.activeTextEditor = mockEditor;
    mockEditor!.selections = mockSelections;

    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(
      new Range(new Position(0, 0), new Position(0, 5)),
    );
    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(
      new Range(new Position(1, 0), new Position(1, 10)),
    );

    mockEditor!.document.getText.mockReturnValueOnce('selectedVar1');
    mockEditor!.document.getText.mockReturnValueOnce('selectedVar2');

    await displayLogMessageCommand().handler(mockExtensionProperties);

    expect(mockEditor!.edit).toHaveBeenCalledTimes(2);
    expect(mockEditor!.edit).toHaveBeenCalledWith(expect.any(Function));
    expect(mockEditBuilder.insert).toHaveBeenCalledTimes(2);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });

  it('应该插入调试日志，未选中，但光标放在变量名上时', async () => {
    window.activeTextEditor = mockEditor;
    mockEditor!.selections = mockSelections;

    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(undefined);
    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(
      new Range(new Position(1, 0), new Position(1, 10)),
    );

    mockEditor!.document.getText.mockReturnValueOnce('');
    mockEditor!.document.getText.mockReturnValueOnce('selectedVar2');

    await displayLogMessageCommand().handler(mockExtensionProperties);

    expect(mockEditor!.edit).toHaveBeenCalledTimes(1);
    expect(mockEditor!.edit).toHaveBeenCalledWith(expect.any(Function));
    expect(mockEditBuilder.insert).toHaveBeenCalledTimes(1);
    expect(mockEditBuilder.insert).toHaveBeenCalledWith(expect.any(Position), expect.any(String));
  });

  it('应该直接返回，当没有选中字符时或光标没有在字符串旁边时', async () => {
    window.activeTextEditor = mockEditor;
    mockEditor!.selections = mockSelections;

    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(undefined);
    mockEditor!.document.getWordRangeAtPosition.mockReturnValueOnce(undefined);

    mockEditor!.document.getText.mockReturnValueOnce('');
    mockEditor!.document.getText.mockReturnValueOnce('');

    await displayLogMessageCommand().handler(mockExtensionProperties);

    expect(mockEditor!.edit).not.toHaveBeenCalled();
  });
});
