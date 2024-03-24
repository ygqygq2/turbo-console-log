import { ExtensionProperties } from '@/typings/extension/types';
import { LanguageProcessor } from './types';

export class GeneralLanguageProcessor implements LanguageProcessor {
  constructor(private readonly languageId: string) {}

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
      case 'c++':
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
      case 'kotlin':
      case 'scala':
      case 'lua':
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
        return `${printFunction} ${escapedVariableName};`;
      }
      case 'perl': {
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
        return `${printFunction} ${escapedVariableName};\n`;
      }
      case 'ruby':
      case 'shellscript':
        return `${printFunction} ${variableName}`;
      case 'c++':
        return `${printFunction} << ${variableName} << std::endl;`;
      case 'rust':
        return `${printFunction}!("{}", ${variableName});`;
      default:
        return `${printFunction}(${variableName})`;
    }
  }

  public getSingleLineCommentSymbol(): string {
    switch (this.languageId) {
      case 'javascript':
      case 'typescript':
      case 'php':
      case 'csharp':
      case 'c++':
      case 'rust':
      case 'kotlin':
      case 'scala':
        return '//';
      case 'python':
      case 'ruby':
      case 'perl':
      case 'go':
      case 'java':
      case 'swift':
      case 'shellscript':
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
      case 'kotlin':
      case 'scala':
      case 'lua':
        return ', ';
      case 'java':
      case 'csharp':
        return ' + ';
      case 'ruby':
      case 'shellscript':
        return ' ';
      case 'perl':
        return ' . " " . ';
      case 'php':
        return ' . ';
      case 'c++':
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
      case 'c++':
      case 'rust':
      case 'kotlin':
      case 'scala':
      case 'lua':
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
