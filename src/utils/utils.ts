/**
 * Sleep micro second
 * @param ms micro second to sleep
 */
export function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function processVariableName(variableName: string) {
  const count = (variableName.match(/\$/g) || []).length; // 统计字符串中的 $ 符号个数
  let escapedVariableName = variableName;
  if (count >= 2 && count % 2 === 0) {
    const halfCount = count / 2;
    let escapedCount = 0;
    escapedVariableName = variableName.replace(/\$/g, (match) => {
      if (escapedCount < halfCount) {
        escapedCount++;
        return '\\$';
      }
      return match;
    });
  }
  return escapedVariableName;
}
