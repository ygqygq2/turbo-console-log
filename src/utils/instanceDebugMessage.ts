import { GeneralDebugMessage } from '@/debug-message/DebugMessage';
import {
  CSharpProcessor,
  GoProcessor,
  JavaProcessor,
  JavaScriptProcessor,
  PerlProcessor,
  PhpProcessor,
  PythonProcessor,
  RubyProcessor,
  ShellProcessor,
  SwiftProcessor,
} from '@/debug-message/LanguageProcessor';
import { LanguageProcessor } from '@/debug-message/types';
import { TextEditor } from 'vscode';

export const instanceDebugMessage = (editor: TextEditor) => {
  let processor: LanguageProcessor;
  const languageId = editor?.document.languageId;
  console.log('languageId', languageId);
  switch (languageId) {
    case 'javascript':
    case 'typescript':
      processor = new JavaScriptProcessor(languageId);
      break;
    case 'python':
      processor = new PythonProcessor(languageId);
      break;
    case 'go':
      processor = new GoProcessor(languageId);
      break;
    case 'java':
      processor = new JavaProcessor(languageId);
      break;
    case 'php':
      processor = new PhpProcessor(languageId);
      break;
    case 'ruby':
      processor = new RubyProcessor(languageId);
      break;
    case 'swift':
      processor = new SwiftProcessor(languageId);
      break;
    case 'csharp':
      processor = new CSharpProcessor(languageId);
      break;
    case 'shellscript':
      processor = new ShellProcessor(languageId);
      break;
    case 'perl':
      processor = new PerlProcessor(languageId);
      break;
    default:
      processor = new JavaScriptProcessor(languageId);
  }
  const debugMessage = new GeneralDebugMessage(processor);
  return { debugMessage };
};
