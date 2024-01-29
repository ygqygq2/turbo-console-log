# Change Log

All notable changes to the "turbo-console-log" extension will be documented in this file.

# [3.0.2]
## 问题修复 🐛
* fix: logFunction 未配置代码类型报错 [#1](https://github.com/ygqygq2/turbo-console-log/issues/1)

# [3.0.1]

## 新增功能 🌱
* feat: 增加快捷键 `ctrl + alt + u` 更新调试日志行号

## 功能优化 🚀
* perf: logFunction 多语言支持
```
  "turboConsoleLog": {
    "includeFileNameAndLineNum": true,
    "logFunction": [
      "php": "echoFunction"
    ]
  }
```

## 问题修复 🐛
* fix: 含 `~` 代码对于调试日志判断不准确问题

# [3.0.0]

## 新增功能 🌱
* feat: 支持更多的语言
