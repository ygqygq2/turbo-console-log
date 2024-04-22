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
        return 'print';
      case 'go':
        return 'fmt.Println';
      case 'java':
        return 'System.out.println';
      case 'php':
        return 'echo';
      case 'ruby':
        return 'puts';
      case 'swift':
        return 'print';
      case 'csharp':
        return 'Console.WriteLine';
      case 'shellscript':
        return 'echo';
      case 'perl':
      case 'lua':
        return 'print';
      case 'cpp':
        return 'std::cout';
      case 'rust':
        return 'println!';
      case 'kotlin':
      case 'scala':
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
        return `${printFunction} ${variableName}`;
      case 'cpp':
        return `${printFunction} << ${variableName} << std::endl;`;
      case 'rust':
        return `${printFunction}(${variableName});`;
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
        return '//';
      case 'python':
      case 'ruby':
      case 'perl':
      case 'shellscript':
      case 'coffeescript':
      case 'php':
        return '#';
      case 'lua':
        return '--';
      default:
        return '//';
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
        return ', ';
      case 'java':
      case 'kotlin':
      case 'scala':
      case 'csharp':
      case 'coffeescript':
      case 'ruby':
        return ' + " " + ';
      case 'shellscript':
        return ' ';
      case 'perl':
      case 'php':
        return ' . " " . ';
      case 'cpp':
        return ' << " " << ';
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
