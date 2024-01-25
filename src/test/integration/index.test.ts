import { describe } from 'mocha';
import coreTests from './core';
import jsFeaturesTests from './lang';

describe('Integration tests', () => {
  coreTests();
  jsFeaturesTests();
});
