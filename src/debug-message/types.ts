export interface LanguageProcessor {
  getPrintStatement(variableName: string, semicolon?: string): string;
}
