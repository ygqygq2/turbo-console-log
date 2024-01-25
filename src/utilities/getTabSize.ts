// 导出一个函数，用于获取tab大小
export function getTabSize(tabSize: string | number | undefined): number {
  // 如果没有传入tabSize，则返回4
  if (!tabSize) {
    return 4;
  }
  // 如果传入的tabSize是字符串，则将其转换为数字
  return typeof tabSize === 'string' ? parseInt(tabSize) : tabSize;
}
