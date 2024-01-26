import * as vscode from 'vscode';
import { DebugMessage } from './debug-message';
import { Command, ExtensionProperties } from './entities';
import { getAllCommands } from './commands/';
import { LanguageProcessor } from './debug-message/types';
import { GeneralDebugMessage } from './debug-message/DebugMessage';
import { JavaScriptProcessor, PythonProcessor } from './debug-message/LanguageProcessor';

// 导出一个函数，用于激活插件
export function activate(): void {
  const fileType = detectFileType(); // 逻辑来确定文件类型
  let processor: LanguageProcessor;

  if (fileType === 'javascript') {
    processor = new JavaScriptProcessor();
  } else if (fileType === 'python') {
    processor = new PythonProcessor();
  }
  processor = new JavaScriptProcessor();
  // 创建一个DebugMessage类
  const generalDebugMessage: DebugMessage = new GeneralDebugMessage(processor, 1);
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
      handler(properties, generalDebugMessage, args);
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
    insertEmptyLineBeforeLogMessage: workspaceConfig.insertEmptyLineBeforeLogMessage ?? false,
    insertEmptyLineAfterLogMessage: workspaceConfig.insertEmptyLineAfterLogMessage ?? false,
    quote: workspaceConfig.quote ?? '"',
    delimiterInsideMessage: workspaceConfig.delimiterInsideMessage ?? '~',
    includeFileNameAndLineNum: workspaceConfig.includeFileNameAndLineNum ?? false,
    logFunction: workspaceConfig.logFunction ?? 'log',
  };
}

function detectFileType(): string | undefined {
  const activeEditor = vscode.window.activeTextEditor;
  return activeEditor?.document.languageId;
}
