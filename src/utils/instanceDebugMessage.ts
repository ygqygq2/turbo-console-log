import { TextEditor } from 'vscode';

import { GeneralDebugMessage } from '@/debug-message/GeneralDebugMessage';
import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';

export const instanceDebugMessage = (editor: TextEditor) => {
  if (!editor) {
    throw new Error('No editor available');
  }
  const languageId = editor?.document.languageId || 'javascript';
  return {
    debugMessage: new GeneralDebugMessage(new GeneralLanguageProcessor(languageId)),
  };
};
