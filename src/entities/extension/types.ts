import { DebugMessage } from '../../debug-message';
import { LogMessageType,  } from './enums';
import { Range } from 'vscode';

export type Command = {
  name: string;
  handler: (
    extensionProperties: ExtensionProperties,
    debugMessage: DebugMessage,
    args?: unknown[],
  ) => Promise<void>;
};

export type LogBracket = {
  openingBrackets: number;
  closingBrackets: number;
};

export type ExtensionProperties = {
  wrapLogMessage: boolean;
  logMessagePrefix: string;
  logMessageSuffix: string;
  addSemicolonInTheEnd: boolean;
  insertEmptyLineBeforeLogMessage: boolean;
  insertEmptyLineAfterLogMessage: boolean;
  delimiterInsideMessage: string;
  includeFileNameAndLineNum: boolean;
  quote: string;
  logFunction: string;
};

export type MultilineContextVariable = {
  openingContextLine: number;
  closingContextLine: number;
};

export type Message = {
  spaces: string;
  lines: Range[];
};

export type BlockType = 'class' | 'function';

export type LogContextMetadata = {
  openingContextLine: number;
  closingContextLine: number;
  deepObjectLine: number;
  deepObjectPath: string;
};
export type NamedFunctionMetadata = {
  line: number;
};

export type LogMessage = {
  logMessageType: LogMessageType;
  metadata?: LogContextMetadata | NamedFunctionMetadata | unknown;
};
