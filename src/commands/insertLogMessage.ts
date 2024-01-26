import * as vscode from 'vscode';
import { GeneralDebugMessage } from '@/debug-message/DebugMessage';
import { JavaScriptProcessor, PythonProcessor } from '@/debug-message/LanguageProcessor';
import { VariableLine } from '@/debug-message/VariableLine';
import { LanguageProcessor } from '@/debug-message/types';

export const insertLogMessage = () => {
  const extensionProperties = getExtensionProperties();
  // 根据当前文件的类型来决定使用哪个Processor
  const fileType = 'javascript'; // 逻辑来确定文件类型，比如 'javascript' 或 'python'
  let processor: LanguageProcessor;

  if (fileType === 'javascript') {
    processor = new JavaScriptProcessor();
  } else if (fileType === 'python') {
    processor = new PythonProcessor();
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }
  const document = editor.document;
  const variableLine = new VariableLine(editor);
  const { line, variable } = variableLine.getCurrentLine();
  const debugMessage = new GeneralDebugMessage(processor, variableLine);
  debugMessage.msg(editor, document, variable, line, 4, extensionProperties);
};
