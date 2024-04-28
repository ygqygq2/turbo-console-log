import { ExtensionProperties } from '@/typings/extension/types';
import { processVariableName } from '@/utils/utils';

import { LanguageProcessor } from './types';

export class GeneralLanguageProcessor implements LanguageProcessor {
  constructor(private readonly languageId: string) {
    this.languageId = languageId;
  }

  public getLanguageId(): string {
    return this.languageId;
  }

  // 根据 languageId 获取对应的 logFunction
  public getLogFunction(logFunction: ExtensionProperties['logFunction']): string {
    if (Object.keys(logFunction).length !== 0) {
      return logFunction[this.languageId] || this.getPrintString();
    }
    return this.getPrintString();
  }

  public getPrintString(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'coffeescript':
        return 'console.log';
      case 'python':
      case 'swift':
      case 'perl':
      case 'lua':
      case 'r':
      case 'dart':
        return 'print';
      case 'go':
        return 'fmt.Println';
      case 'java':
        return 'System.out.println';
      case 'php':
        return 'echo';
      case 'ruby':
        return 'puts';
      case 'csharp':
        return 'Console.WriteLine';
      case 'shellscript':
        return 'echo';
      case 'cpp':
        return 'std::cout';
      case 'rust':
        return 'println!';
      case 'kotlin':
      case 'scala':
      case 'groovy':
        return 'println';
      default:
        return 'console.log';
    }
  }

  public getPrintStatement(
    variableName: string,
    logFunctionByLanguageId?: string,
    quote: string = '"',
    semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId || this.getPrintString();
    const isSingleQuote = quote === "'";
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'swift':
        return `${printFunction}(${variableName})${semicolon}`;
      case 'csharp':
      case 'java':
      case 'rust':
      case 'dart':
        return `${printFunction}(${variableName});`;
      case 'python':
      case 'go':
      case 'kotlin':
      case 'scala':
      case 'lua':
        return `${printFunction}(${variableName})`;
      case 'php': {
        if (!isSingleQuote) {
          const escapedVariableName = processVariableName(variableName);
          return `${printFunction} ${escapedVariableName};`;
        }
        return `${printFunction} ${variableName};`;
      }
      case 'perl': {
        if (!isSingleQuote) {
          const escapedVariableName = processVariableName(variableName);
          return `${printFunction} ${escapedVariableName};\n`;
        }
        return `${printFunction} ${variableName};`;
      }
      case 'ruby':
      case 'shellscript':
      case 'coffeescript':
      case 'groovy':
        return `${printFunction} ${variableName}`;
      case 'cpp':
        return `${printFunction} << ${variableName} << std::endl;`;
      case 'r':
        return `${printFunction}(paste(${variableName}))`;
      default:
        return `${printFunction}(${variableName})`;
    }
  }

  public getSingleLineCommentSymbol(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'csharp':
      case 'cpp':
      case 'rust':
      case 'kotlin':
      case 'scala':
      case 'java':
      case 'go':
      case 'swift':
      case 'dart':
      case 'groovy':
        return '//';
      case 'python':
      case 'ruby':
      case 'perl':
      case 'shellscript':
      case 'coffeescript':
      case 'php':
      case 'r':
        return '#';
      case 'lua':
        return '--';
      default:
        return '//';
    }
  }

  public getExtraSpace(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'go':
      case 'swift':
      case 'python':
      case 'lua':
      case 'shellscript':
        return '';
      case 'java':
      case 'kotlin':
      case 'scala':
      case 'csharp':
      case 'coffeescript':
      case 'ruby':
      case 'perl':
      case 'php':
      case 'cpp':
      case 'dart':
      case 'r':
      case 'groovy':
        return ' ';
      case 'rust':
        return ' {}';
      default:
        return '';
    }
  }

  public getConcatenatedString(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'go':
      case 'swift':
      case 'python':
      case 'rust':
      case 'lua':
      case 'r':
        return ', ';
      case 'java':
      case 'kotlin':
      case 'scala':
      case 'csharp':
      case 'coffeescript':
      case 'ruby':
      case 'dart':
      case 'groovy':
        return ' + ';
      case 'shellscript':
        return ' ';
      case 'perl':
      case 'php':
        return ' . ';
      case 'cpp':
        return ' << ';
      default:
        return ', ';
    }
  }

  public variableToString(variableName: string): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'go':
      case 'java':
      case 'csharp':
      case 'python':
      case 'swift':
      case 'ruby':
      case 'cpp':
      case 'rust':
      case 'kotlin':
      case 'scala':
      case 'lua':
      case 'coffeescript':
      case 'dart':
      case 'groovy':
      case 'r':
        return `${variableName}`;
      case 'perl':
      case 'php':
        if (variableName.includes('$')) {
          return variableName;
        } else {
          return '$' + variableName;
        }
      case 'shellscript':
        return `\${${variableName}}`;
      default:
        return `${variableName}`;
    }
  }
}
