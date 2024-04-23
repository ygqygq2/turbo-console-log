export type CursorPosition = {
  line: number;
  character: number;
};

export type TestInfo = {
  testName: string;
  workspaceFoldName: string;
  files: {
    fileName: string;
    cursorPosition: CursorPosition;
  }[];
}[];
