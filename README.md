> * 为了支持各种语言打印输出，修改原作者的代码。
> * 逻辑更纯粹，维护更简单。直接变量的下一行生成打印日志，再移动到需要的地方，再更新日志行号即可。

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/ygqygq2.turbo-print-log.svg?color=07c160&label=turbo-print-log&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=ygqygq2.turbo-print-log)
![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/ygqygq2.turbo-print-log)


# Main Functionality

Turbo Console Log extension makes debugging much easier by automating the operation of writing meaningful log message.

## Instructions for usage
### 1. Insert a meaningful log message

Two steps:

- Selecting or hovering the variable which is the subject of the debugging (Manual selection will always take over the hover selection)

- Pressing ctrl + alt + l (Windows) or ctrl + option + l (Mac)

The log message will be inserted in the next line relative to the selected variable like the following:

`console.log("🚀 ~ file: extension.ts:8 ~ config:", config)`

> * The log function and the content of the log message can be customized in the extension settings (see Settings section for more details).
> * Multiple cursor selection is also supported.

### 2. Update line number for log message in a file

- Update the log message line number for all message

- Pressing ctrl + alt + u (Windows) or ctrl + option + u (Mac)

> * `includeFileNameAndLineNum` must be set to `true`

### 3. Comment all log messages, inserted by the extension, from the current document

All it takes to comment all log messages, inserted by the extension, from the current document is to press alt + shift + c (Windows) or option + shift + c (Mac)

### 4. Uncomment all log messages, inserted by the extension, from the current document

All it takes to uncomment all log messages, inserted by the extension, from the current document is to press alt + shift + u (Windows) or option + shift + u (Mac)

### 5. Delete all log messages, inserted by the extension, from the current document

All it takes to delete all log messages, inserted by the extension, from the current document is to press alt + shift + d (Windows) or option + shift + d (Mac)

## Settings

Properties:

| Feature                              | Description                                                                                                                 | Setting                         | Default        |
| ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------- |
| Custom Prefix                        | The prefix of the log message                                                                                               | logMessagePrefix                | `🚀`           |
| Custom Suffix                        | The suffix of the log message                                                                                               | logMessageSuffix                | `:`            |
| Custom Log Function                  | Custom log function to use in the inserted log message                                                                      | logFunction                     | `{}`           |
| Delimiter Inside Message             | The delimiter that will separate the different log message elements (file name, line number, class, function, and variable) | delimiterInsideMessage          | `~`            |
| Quote                                | Double quotes ("") or single quotes ('')                                                                                    | quote                           | `"`            |
| Add Semicolon In The End             | Whether to put a semicolon at the end of the log message or not by language                                                 | addSemicolonInTheEnd            | `true`         |
| Include File Name And Line Number    | Whether to include the file name and the line number of the log message                                                     | includeFileNameAndLineNum       | `true`         |
| Wrap Log Message                     | Whether to wrap the log message or not                                                                                      | wrapLogMessage                  | `false`       |
| Insert Empty Line Before Log Message | Whether to insert an empty line before the log message or not                                                               | insertEmptyLineBeforeLogMessage | `false`        |
| Insert Empty Line After Log Message  | Whether to insert an empty line after the log message or not                                                                | insertEmptyLineAfterLogMessage  | `false`        |

## License

MIT Copyright &copy; Turbo Console Log
