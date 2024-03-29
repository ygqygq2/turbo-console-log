import { createErrorCodeMessages, ErrorCodeMessage } from '@ygqygq2/vscode-log';

export enum CustomErrorCode {
  // 运行相关错误 (1000 - 1009)
  RUN_ERROR = 1000,
}

const extensionPrefix = '';

const execCustomErrorCodeMessage = {
  [CustomErrorCode.RUN_ERROR]: `${extensionPrefix}Run error.`,
};

export const customErrorCodeMessages: ErrorCodeMessage = {
  ...execCustomErrorCodeMessage,
};

export const { errorCodeEnum, errorCodeMessages } = createErrorCodeMessages(
  CustomErrorCode,
  customErrorCodeMessages,
);
