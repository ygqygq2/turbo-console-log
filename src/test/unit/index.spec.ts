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
