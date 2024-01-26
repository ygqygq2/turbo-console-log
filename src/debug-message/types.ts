import { TextDocument } from 'vscode';
import { LogMessage } from '../entities';

export interface LanguageProcessor {
  getPrintStatement(variableName: string): string;
}

export interface DebugMessageLine {
  line(
    document: TextDocument,
    selectionLine: number,
    selectedVar: string,
    logMsg: LogMessage,
  ): number;
}
