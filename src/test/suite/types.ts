export type CursorPosition = {
  line: number;
  character: number;
};

export type TestInfo = {
  testName: string;
  workspaceName: string;
  files: {
    fileName: string;
    cursorPosition: CursorPosition;
  }[];
}[];
