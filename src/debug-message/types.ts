import { ExtensionProperties } from '@/typings';

export interface LanguageProcessor {
  getLanguageId(): string;
  getLogFunction(logFunction: ExtensionProperties['logFunction']): string;
  getPrintString(): string;
  getPrintStatement(variableName: string, logFunctionByLanguageId?: string, semicolon?: string): string;
  getSingleLineCommentSymbol(): string;
  getExtraSpace(): string;
  getConcatenatedString(): string;
  variableToString(variableName: string): string;
}
