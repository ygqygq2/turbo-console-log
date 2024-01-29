import { ExtensionProperties } from '@/typings/extension/types';
import { LanguageProcessor } from './types';

export class GeneralLanguageProcessor implements LanguageProcessor {
  constructor(private readonly languageId: string) {}

  // 根据 languageId 获取对应的 logFunction
  getLogFunction(logFunction: ExtensionProperties['logFunction']): string {
    if (Array.isArray(logFunction)) {
      const logFunctionObj = logFunction.find((obj) =>
        Object.prototype.hasOwnProperty.call(obj, this.languageId),
      );
      const logFunctionValue = logFunctionObj ? logFunctionObj[this.languageId] : undefined;
      return logFunctionValue || '';
    }
    return '';
  }

  getPrintString(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
        return 'console.log';
      case 'python':
        return 'print';
      case 'go':
        return 'fmt.println';
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
        return 'print';
      default:
        return 'console.log';
    }
  }

  getPrintStatement(
    variableName: string,
    logFunctionByLanguageId?: string,
    semicolon: string = '',
  ): string {
    const printFunction = logFunctionByLanguageId || this.getPrintString();
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
        return `${printFunction}(${variableName})`;
      case 'php': {
        const count = (variableName.match(/\$/g) || []).length; // 统计字符串中的 $ 符号个数
        let escapedVariableName = variableName;
        if (count >= 2 && count % 2 === 0) {
          const halfCount = count / 2;
          let escapedCount = 0;
          escapedVariableName = variableName.replace(/\$/g, (match) => {
            if (escapedCount < halfCount) {
              escapedCount++;
              return '\\$';
            }
            return match;
          });
        }
        return `${printFunction} ${escapedVariableName}`;
      }
      case 'ruby':
      case 'shellscript':
        return `${printFunction} ${variableName}`;
      case 'perl':
        return `${printFunction} ${variableName}\n`;
      default:
        return `${printFunction}(${variableName})`;
    }
  }

  getSingleLineCommentSymbol(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'php':
      case 'csharp':
        return '//';
      case 'python':
      case 'ruby':
      case 'perl':
      case 'go':
      case 'java':
      case 'swift':
      case 'shellscript':
        return '#';
      default:
        return '//';
    }
  }

  getConcatenatedString(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'go':
      case 'swift':
        return ', ';
      case 'java':
      case 'csharp':
        return ' + ';
      case 'python':
      case 'ruby':
      case 'perl':
      case 'shellscript':
        return ' ';
      case 'php':
        return ' . ';
      default:
        return ', ';
    }
  }

  variableToString(variableName: string): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'go':
      case 'java':
      case 'csharp':
      case 'python':
      case 'swift':
      case 'perl':
      case 'ruby':
        return `${variableName}`;
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
