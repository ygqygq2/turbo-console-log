import { LineCodeProcessing } from '..';

export class JSLineCodeProcessing implements LineCodeProcessing {
  // 判断是否是匿名函数
  isAnonymousFunction(loc: string): boolean {
    return /.*=>.*/.test(loc);
  }
  // 判断是否是匿名函数的参数
  isArgumentOfAnonymousFunction(loc: string, argument: string): boolean {
    if (this.isAnonymousFunction(loc)) {
      const match = loc.match(/(\(.*\)|\w+)\s*=>/);
      return match !== null && match[1].includes(argument);
    }
    return false;
  }
  // 判断是否需要转换匿名函数
  shouldTransformAnonymousFunction(loc: string): boolean {
    if (this.isAnonymousFunction(loc)) {
      if (/.*=>\s+{/.test(loc)) {
        return false;
      }
      return true;
    }
    return false;
  }
  // 判断是否是赋值给变量
  isAssignedToVariable(loc: string): boolean {
    return /(const|let|var).*{?\s*}?=.*/.test(loc);
  }
  // 判断是否是赋值给变量
  isAffectationToVariable(loc: string): boolean {
    return /.*=.*/.test(loc);
  }
  // 判断是否是对象赋值给变量
  isObjectLiteralAssignedToVariable(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replace(/\s/g, '');
    return /(const|let|var)\w+(:?.*)={(\w+(\(\)|:?.*))/g.test(
      locWithoutWhiteSpaces,
    );
  }

  // 判断是否是数组赋值给变量
  isArrayAssignedToVariable(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replace(/\s/g, '');
    return /(const|let|var).*=\[.*/.test(locWithoutWhiteSpaces);
  }
  // 判断是否包含类声明
  doesContainClassDeclaration(loc: string): boolean {
    return /class(\s+).*{/.test(loc);
  }
  // 获取类名
  getClassName(loc: string): string {
    if (this.doesContainClassDeclaration(loc)) {
      return loc.split('class ')[1].trim().split(' ')[0].replace('{', '');
    } else {
      return '';
    }
  }
  // 判断是否包含内置函数
  doesContainsBuiltInFunction(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replace(/\s/g, '');
    return /(if|switch|while|for|catch|do)\(.*\)/.test(locWithoutWhiteSpaces);
  }
  // 判断是否包含命名函数声明
  doesContainsNamedFunctionDeclaration(loc: string): boolean {
    const locWithoutFunctionKeyword = loc.replace('function', '');
    const regularNamedFunctionRegex = new RegExp(
      /\s*[a-zA-Z0-9]+\s*\(.*\):?.*{/,
    );
    const regularFunctionAssignedToVariableRegex = new RegExp(
      /(const|let|var)(\s*)[a-zA-Z0-9]*\s*=(\s*)\(.*\)(\s*){/,
    );
    const arrowFunctionAssignedToVariableRegex = new RegExp(
      /(const|let|var)(\s*)[a-zA-Z0-9]*\s*=.*=>.*/,
    );
    return (
      regularNamedFunctionRegex.test(locWithoutFunctionKeyword) ||
      regularFunctionAssignedToVariableRegex.test(locWithoutFunctionKeyword) ||
      arrowFunctionAssignedToVariableRegex.test(loc)
    );
  }
  // 判断是否是函数赋值给变量
  isFunctionAssignedToVariable(loc: string): boolean {
    return /(const|let|var)?.*\s*=.*\(.*/.test(loc);
  }
  // 判断是否是函数声明
  isFunctionDeclaration(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replace(/\s/g, '');
    const isDecorator = /@/.test(loc.split('(')[0]);
    return (
      (/.*\(.*/.test(locWithoutWhiteSpaces) ||
        /=>/.test(locWithoutWhiteSpaces)) &&
      !isDecorator
    );
  }
  // 判断是否是对象函数调用
  isObjectFunctionCall(loc: string): boolean {
    const locWithoutWhiteSpaces = loc.replace(/\s/g, '');
    return /([a-zA-Z0-9]+\.[a-zA-Z0-9]+)\({1,}/.test(locWithoutWhiteSpaces);
  }
  // 获取函数名
  getFunctionName(loc: string): string {
    if (this.doesContainsNamedFunctionDeclaration(loc)) {
      if (/(const|let|var)(\s*)[a-zA-Z0-9]*\s*=/.test(loc)) {
        return loc
          .split('=')[0]
          .replace(/export |module.exports |const |var |let |=|(\s*)/g, '');
      } else if (/function(\s+)/.test(loc)) {
        return loc.split('function ')[1].split('(')[0].replace(/(\s*)/g, '');
      } else {
        return loc
          .split(/\(.*\)/)[0]
          .replace(
            /async |static |public |private |protected |export |default |(\s*)/g,
            '',
          );
      }
    } else {
      return '';
    }
  }
}
