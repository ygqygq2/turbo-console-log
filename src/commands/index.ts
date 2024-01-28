import { displayLogMessageCommand } from './displayLogMessage';
import { commentAllLogMessagesCommand } from './commentAllLogMessages';
import { uncommentAllLogMessagesCommand } from './uncommentAllLogMessages';
import { deleteAllLogMessagesCommand } from './deleteAllLogMessages';
import { updateLineNumAllLogMessagesCommand } from './updateLineNumAllLogMessages';
import { Command } from '../typings';

export function getAllCommands(): Array<Command> {
  return [
    displayLogMessageCommand(),
    commentAllLogMessagesCommand(),
    uncommentAllLogMessagesCommand(),
    deleteAllLogMessagesCommand(),
    updateLineNumAllLogMessagesCommand(),
  ];
}
