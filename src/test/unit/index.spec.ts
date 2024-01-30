// import { add, subtract } from '@/mocha-test';
// import { expect } from 'chai';

// // describe和it函数用于组织测试套件和测试用例
// describe('Calculator', () => {
//   // 编写add方法的测试用例
//   describe('add', () => {
//     it('should return the sum of two numbers', () => {
//       const result = add(2, 3);
//       expect(result).to.equal(5);
//     });
//   });

//   // 编写subtract方法的测试用例
//   describe('subtract', () => {
//     it('should return the difference between two numbers', () => {
//       const result = subtract(5, 3);
//       expect(result).to.equal(2);
//     });
//   });
// });

import { mochaTest } from '@/mocha-test';
import { equal } from 'assert';

describe('Typescript usage suite', () => {
  it('should be able to execute a test', () => {
    equal(true, true);
  });
  it('should return expected string', () => {
    equal(mochaTest('incoming'), 'incoming-static');
  });
});
