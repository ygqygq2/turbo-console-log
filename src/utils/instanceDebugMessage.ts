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
      processor = new JavaScriptProcessor();
      break;
    case 'python':
      processor = new PythonProcessor();
      break;
    case 'go':
      processor = new GoProcessor();
      break;
    case 'java':
      processor = new JavaProcessor();
      break;
    case 'php':
      processor = new PhpProcessor();
      break;
    case 'ruby':
      processor = new RubyProcessor();
      break;
    case 'swift':
      processor = new SwiftProcessor();
      break;
    case 'csharp':
      processor = new CSharpProcessor();
      break;
    case 'shellscript':
      processor = new ShellProcessor();
      break;
    case 'perl':
      processor = new PerlProcessor();
      break;
    default:
      processor = new JavaScriptProcessor();
  }
  const debugMessage = new GeneralDebugMessage(processor);
  return { debugMessage };
};
