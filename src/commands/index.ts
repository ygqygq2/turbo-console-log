import { Command } from '../typings';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { displayLogMessageCommand } from './displayLogMessage';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { updateLineNumAllLogMessagesCommand } from './updateLineNumAllLogMessages';

export function getAllCommands(): Array<Command> {
  return [
    displayLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    updateLineNumAllLogMessagesCommand(),
  ];
}
