import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { JSDebugMessage } from './debug-message/js';
import { Command, ExtensionProperties } from './entities';
import { LineCodeProcessing } from './line-code-processing';
import { JSLineCodeProcessing } from './line-code-processing/js';
import { getAllCommands } from './commands/';
import { DebugMessageLine } from './debug-message/types';
import { JSDebugMessageLine } from './debug-message/js/JSDebugMessageLine';

// 导出一个函数，用于激活插件
export function activate(): void {
  // 创建一个JS行代码处理类
  const jsLineCodeProcessing: LineCodeProcessing = new JSLineCodeProcessing();
  // 创建一个DebugMessageLine类
  const debugMessageLine: DebugMessageLine = new JSDebugMessageLine(jsLineCodeProcessing);
  // 创建一个DebugMessage类
  const jsDebugMessage: DebugMessage = new JSDebugMessage(jsLineCodeProcessing, debugMessageLine);
  // 获取配置信息
  const config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration('turboConsoleLog');
  // 获取扩展属性
  const properties: ExtensionProperties = getExtensionProperties(config);
  // 获取所有命令
  const commands: Array<Command> = getAllCommands();
  // 遍历所有命令，注册命令
  for (const { name, handler } of commands) {
    vscode.commands.registerCommand(name, (args: unknown[]) => {
      handler(properties, jsDebugMessage, args);
    });
  }
}

// 获取扩展属性
function getExtensionProperties(workspaceConfig: vscode.WorkspaceConfiguration) {
  // 返回扩展属性
  return {
    wrapLogMessage: workspaceConfig.wrapLogMessage ?? false,
    logMessagePrefix: workspaceConfig.logMessagePrefix ?? '🚀',
    logMessageSuffix: workspaceConfig.logMessageSuffix ?? ':',
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd ?? false,
    insertEnclosingClass: workspaceConfig.insertEnclosingClass ?? true,
    insertEnclosingFunction: workspaceConfig.insertEnclosingFunction ?? true,
    insertEmptyLineBeforeLogMessage: workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage: workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeFileNameAndLineNum: workspaceConfig.includeFileNameAndLineNum ?? false,
    logType: workspaceConfig.logType ?? 'log',
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}
