import { GeneralLanguageProcessor } from '@/debug-message/LanguageProcessor';
import { expect } from 'chai';

describe('GeneralLanguageProcessor', () => {
  // 测试 getLogFunction 方法
  describe('#getLogFunction', () => {
    const logFunctions = {
      javascript: 'console.log',
      python: 'print',
      // 添加更多的语言和对应的日志函数
    };

    it('should return the correct log function for a given languageId', () => {
      const processor = new GeneralLanguageProcessor('javascript');
      expect(processor.getLogFunction(logFunctions)).to.equal('console.log');
    });

    it('should return an empty string if the languageId does not exist', () => {
      const processor = new GeneralLanguageProcessor('unknown');
      expect(processor.getLogFunction(logFunctions)).to.equal('');
    });
  });

  // 测试 getPrintString 方法
  describe('#getPrintString', () => {
    it('should return the correct print function for supported languages', () => {
      const languages = [
        { id: 'javascript', print: 'console.log' },
        { id: 'python', print: 'print' },
        // 添加更多的语言和期望的结果
      ];
      languages.forEach((lang) => {
        const processor = new GeneralLanguageProcessor(lang.id);
        expect(processor.getPrintString()).to.equal(lang.print);
      });
    });

    it('should return "console.log" for unsupported languages', () => {
      const processor = new GeneralLanguageProcessor('unsupported');
      expect(processor.getPrintString()).to.equal('console.log');
    });
  });

  // 测试 getPrintStatement 方法
  describe('#getPrintStatement', () => {
    const variableName = 'testVariable';

    it('should return the correct print statement for supported languages', () => {
      const processorJS = new GeneralLanguageProcessor('javascript');
      expect(processorJS.getPrintStatement(variableName)).to.equal(`console.log(${variableName})`);

      const processorPython = new GeneralLanguageProcessor('python');
      expect(processorPython.getPrintStatement(variableName)).to.equal(`print(${variableName})`);

      // 添加更多语言的测试用例
    });

    it('should correctly escape variables in PHP', () => {
      const processorPHP = new GeneralLanguageProcessor('php');
      const phpVariableName = '$testVariable';
      expect(processorPHP.getPrintStatement(phpVariableName)).to.equal(`echo ${phpVariableName};`);
    });

    // 添加更多的测试用例...
  });

  // 测试 getSingleLineCommentSymbol 方法
  describe('#getSingleLineCommentSymbol', () => {
    it('should return the correct comment symbol for supported languages', () => {
      const processorJS = new GeneralLanguageProcessor('javascript');
      expect(processorJS.getSingleLineCommentSymbol()).to.equal('//');

      const processorPython = new GeneralLanguageProcessor('python');
      expect(processorPython.getSingleLineCommentSymbol()).to.equal('#');

      // 添加更多语言的测试用例
    });

    it('should return "//" for an unsupported language', () => {
      const processor = new GeneralLanguageProcessor('unsupported');
      expect(processor.getSingleLineCommentSymbol()).to.equal('//');
    });
  });

  // 测试 getConcatenatedString 方法
  describe('#getConcatenatedString', () => {
    it('should return the correct concatenated string for supported languages', () => {
      const processorJS = new GeneralLanguageProcessor('javascript');
      expect(processorJS.getConcatenatedString()).to.equal(', ');

      const processorPython = new GeneralLanguageProcessor('python');
      expect(processorPython.getConcatenatedString()).to.equal(' ');

      // 添加更多语言的测试用例
    });
  });

  // 测试 variableToString 方法
  describe('#variableToString', () => {
    it('should return the correct string representation of a variable for supported languages', () => {
      const processorJS = new GeneralLanguageProcessor('javascript');
      expect(processorJS.variableToString('testVariable')).to.equal('testVariable');

      const processorPHP = new GeneralLanguageProcessor('php');
      expect(processorPHP.variableToString('testVariable')).to.equal('$testVariable');

      // 添加更多语言的测试用例
    });

    it('should not add a $ prefix for PHP if already present', () => {
      const processorPHP = new GeneralLanguageProcessor('php');
      const variableName = '$testVariable';
      expect(processorPHP.variableToString(variableName)).to.equal(variableName);
    });
  });

  // 更多测试函数...
});
