import * as Chai from 'chai';

declare global {
  interface Window {
    expect: Chai.ExpectStatic;
  }
  const expect: Chai.ExpectStatic;
}
