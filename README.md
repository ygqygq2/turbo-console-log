> * 为了支持各种语言打印输出，修改原作者的代码。

# Main Functionality

Turbo Console Log extension makes debugging much easier by automating the operation of writing meaningful log message.

### I) Insert a meaningful log message

Two steps:

- Selecting or hovering the variable which is the subject of the debugging (Manual selection will always take over the hover selection)

- Pressing ctrl + alt + L (Windows) or ctrl + option + L (Mac)

The log message will be inserted in the next line relative to the selected variable like the following:

`console.log('🚀 ~ line 8 ~ variable', variable);`

The log function and the content of the log message can be customized in the extension settings (see Settings section for more details).

Multiple cursor selection is also supported.

### II) Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c (Windows) or option + shift + c (Mac)

### III) Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u (Windows) or option + shift + u (Mac)

### IV) Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d (Windows) or option + shift + d (Mac)

## Settings

Properties:

| Feature                              | Description                                                                                                                 | Setting                         | Default     |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ----------- |
| Custom Prefix                        | The prefix of the log message                                                                                               | logMessagePrefix                | 🚀          |
| Custom Suffix                        | The suffix of the log message                                                                                               | logMessageSuffix                | :           |
| Custom Log Function                  | Custom log function to use in the inserted log message, when specified logType property will be ignored                     | logFunction                     | console.log |
| Delimiter Inside Message             | The delimiter that will separate the different log message elements (file name, line number, class, function, and variable) | delimiterInsideMessage          | ~           |
| Quote                                | Double quotes ("") or single quotes ('')                                                                                    | quote                           | "           |
| Add Semicolon In The End             | Whether to put a semicolon at the end of the log message or not                                                             | addSemicolonInTheEnd            | true        |
| Include File Name And Line Number    | Whether to include the file name and the line number of the log message                                                     | includeFileNameAndLineNum       | true        |
| Wrap Log Message                     | Whether to wrap the log message or not                                                                                      | wrapLogMessage                  | true        |
| Insert Empty Line Before Log Message | Whether to insert an empty line before the log message or not                                                               | insertEmptyLineBeforeLogMessage | true        |
| Insert Empty Line After Log Message  | Whether to insert an empty line after the log message or not                                                                | insertEmptyLineAfterLogMessage  | true        |

## License

MIT Copyright &copy; Turbo Console Log
