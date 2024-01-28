import * as vscode from 'vscode';
import { Command, ExtensionProperties } from './typings';
import { getAllCommands } from './commands/';

// 导出一个函数，用于激活插件
export function activate(): void {
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
      handler(properties, args);
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
    addSemicolonInTheEnd: workspaceConfig.addSemicolonInTheEnd ?? true,
    insertEmptyLineBeforeLogMessage: workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage: workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeFileNameAndLineNum: workspaceConfig.includeFileNameAndLineNum ?? true,
    logFunction: workspaceConfig.logFunction ?? [],
  };
}
