import { GeneralDebugMessage } from '@/debug-message/DebugMessage';
import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';
import { TextEditor } from 'vscode';

export const instanceDebugMessage = (editor: TextEditor) => {
  const languageId = editor?.document.languageId || 'javascript';
  const processor = new GeneralLanguageProcessor(languageId);
  const debugMessage = new GeneralDebugMessage(processor);
  return { debugMessage };
};
