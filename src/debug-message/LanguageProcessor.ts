import { LanguageProcessor } from './types';

export class JavaScriptProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ''): string {
    return `console.log(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ',';
  }
}

export class TypeScriptProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ''): string {
    return `console.log(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return ',';
  }
}

export class PythonProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `print(${variableName})`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }

  getConcatenatedString(): string {
    return '';
  }
}

export class GoProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `fmt.Println(${variableName})`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return '+';
  }
}

export class JavaProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ';'): string {
    return `System.out.println(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }

  getConcatenatedString(): string {
    return '+';
  }
}

export class PhpProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ';'): string {
    return `echo ${variableName}${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }
}

export class RubyProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `puts ${variableName}`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }
}

export class SwiftProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `print(${variableName})`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }
}

export class CSharpProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ';'): string {
    return `Console.WriteLine(${variableName})${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '//';
  }
}

export class ShellProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string, semicolon: string = ''): string {
    return `echo ${variableName}${semicolon}`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }
}

export class PerlProcessor implements LanguageProcessor {
  getPrintStatement(variableName: string): string {
    return `print ${variableName}`;
  }

  getSingleLineCommentSymbol(): string {
    return '#';
  }
}
