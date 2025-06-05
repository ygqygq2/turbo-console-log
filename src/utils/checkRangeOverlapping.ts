import { TextEditor } from 'vscode';

import { Message } from '@/typings';

export const checkRangeOverlapping = (logMessages: Message[], editor: TextEditor) => {
  if (editor.selections.length === 0) {
    return false; // 如果没有选区，直接返回 false
  }

  const rangeToCheck = editor.selections[0];
  const overlappingMessages = logMessages.filter(({ lines }) => {
    return lines.some((lineRange) => {
      if (!lineRange || !lineRange.intersection) {
        return false; // 如果 lineRange 或 intersection 方法不存在，跳过
      }

      const intersectionRange = lineRange.intersection(rangeToCheck);
      if (intersectionRange !== undefined) {
        console.log('范围重叠的信息：');
        console.log(
          '范围A:',
          lineRange.start.line,
          lineRange.start.character,
          '-',
          lineRange.end.line,
          lineRange.end.character,
        );
        console.log(
          '范围B:',
          rangeToCheck.start.line,
          rangeToCheck.start.character,
          '-',
          rangeToCheck.end.line,
          rangeToCheck.end.character,
        );
        console.log(
          '重叠范围:',
          intersectionRange.start.line,
          intersectionRange.start.character,
          '-',
          intersectionRange.end.line,
          intersectionRange.end.character,
        );
      }
      return intersectionRange !== undefined;
    });
  });

  return overlappingMessages.length > 0;
};
