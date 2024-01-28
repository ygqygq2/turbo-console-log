export interface LanguageProcessor {
  getPrintString(): string;
  getPrintStatement(variableName: string, semicolon?: string): string;
  getSingleLineCommentSymbol(): string;
  getConcatenatedString(): string;
  variableToString(variableName: string): string;
}
