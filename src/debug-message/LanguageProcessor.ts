import { LanguageProcessor } from './types';

export class JavaScriptProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string) {
    return `console.log(${variableName});`;
  }
}

export class PythonProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string) {
    return `print(${variableName});`;
  }
}
