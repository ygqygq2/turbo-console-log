import { LanguageProcessor } from './types';

export class JavaScriptProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ''): string {
    return `console.log(${variableName})${semicolon}`;
  }
}

export class PythonProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `print(${variableName})`;
  }
}
