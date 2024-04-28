import { printLogTester } from './common/printLogTester';
import { TestInfo } from './types';

const testInfo: TestInfo = [
  {
    testName: 'addLog',
    workspaceFoldName: 'add-log',
    files: [
      { fileName: 'no-print-log.coffee', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.cpp', cursorPosition: { line: 0, character: 12 } },
      { fileName: 'no-print-log.cs', cursorPosition: { line: 0, character: 7 } },
      { fileName: 'no-print-log.dart', cursorPosition: { line: 0, character: 4 } },
      { fileName: 'no-print-log.go', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.groovy', cursorPosition: { line: 0, character: 4 } },
      { fileName: 'no-print-log.java', cursorPosition: { line: 0, character: 7 } },
      { fileName: 'no-print-log.js', cursorPosition: { line: 0, character: 6 } },
      // { fileName: 'no-print-log.kt', cursorPosition: { line: 0, character: 4 } },
      { fileName: 'no-print-log.lua', cursorPosition: { line: 0, character: 6 } },
      // { fileName: 'no-print-log.php', cursorPosition: { line: 0, character: 6 } },
      // { fileName: 'no-print-log.pl', cursorPosition: { line: 0, character: 3 } },
      { fileName: 'no-print-log.py', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.r', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.rb', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.rs', cursorPosition: { line: 0, character: 4 } },
      // { fileName: 'no-print-log.scala', cursorPosition: { line: 0, character: 4 } },
      { fileName: 'no-print-log.sh', cursorPosition: { line: 0, character: 0 } },
      { fileName: 'no-print-log.swift', cursorPosition: { line: 0, character: 4 } },
      { fileName: 'no-print-log.ts', cursorPosition: { line: 0, character: 6 } },
    ],
  },
];

printLogTester(testInfo);
