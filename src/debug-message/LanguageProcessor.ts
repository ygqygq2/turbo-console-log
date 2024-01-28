import { ExtensionProperties } from '@/typings/extension/types';
import { LanguageProcessor } from './types';

export type LanguageProcessorUnion =
  | JavaScriptProcessor
  | PythonProcessor
  | GoProcessor
  | JavaProcessor
  | PhpProcessor
  | RubyProcessor
  | SwiftProcessor
  | CSharpProcessor
  | ShellProcessor
  | PerlProcessor;

export abstract class BaseLanguageProcessor implements LanguageProcessor {
  constructor(private readonly languageId: string) {}

  abstract getPrintString(): string;
  abstract getPrintStatement(variableName: string, semicolon?: string): string;
  abstract getSingleLineCommentSymbol(): string;
  abstract getConcatenatedString(): string;
  abstract variableToString(variableName: string): string;

  // 根据 languageId 获取对应的 logFunction
  getLogFunction(logFunction: ExtensionProperties['logFunction']): string {
    const logFunctionObj = logFunction.find((obj) =>
      Object.prototype.hasOwnProperty.call(obj, this.languageId),
    );
    const logFunctionValue = logFunctionObj ? logFunctionObj[this.languageId] : undefined;
    return logFunctionValue || '';
  }
}

export class JavaScriptProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'console.log';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ',';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class PythonProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'print';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName})`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }

  getConcatenatedString(): string {
    return ' ';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class GoProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'fmt.println';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName})`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ',';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class JavaProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'System.out.println';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName});`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ' +';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class PhpProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'echo';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = ';',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName});`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ' .';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class RubyProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'puts';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction} ${variableName}`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }

  getConcatenatedString(): string {
    return ' ';
  }

  variableToString(variableName: string): string {
    return `#{${variableName}}`;
  }
}

export class SwiftProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'print';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ',';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class CSharpProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'Console.WriteLine';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = ';',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction}(${variableName});`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ' +';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}

export class ShellProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'echo';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = ';',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction} ${variableName}`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }

  getConcatenatedString(): string {
    return ' ';
  }

  variableToString(variableName: string): string {
    return `\${${variableName}}`;
  }
}

export class PerlProcessor extends BaseLanguageProcessor {
  getPrintString(): string {
    return 'print';
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId: string,
    _semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId ? logFunctionByLanguageId : this.getPrintString();
    return `${printFunction} ${variableName}\n`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }

  getConcatenatedString(): string {
    return ' ';
  }

  variableToString(variableName: string): string {
    return `${variableName}`;
  }
}
