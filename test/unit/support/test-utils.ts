import { inspect as nodeInspect } from 'node:util';
import colors from 'colors';
import Mocha from 'mocha';
import addContext from 'mochawesome/addContext.js';
import { expect } from 'chai';

export const inspect = (obj: any) => {
  console.log(nodeInspect(obj, { depth: 12 }));
}

export const logContext = (testName: string, ctx: any) => {
  console.error('='.repeat(40))
  console.error('Context for failed test:', testName.cyan);
  console.error(nodeInspect(ctx, { depth: 12 }));
  console.error('='.repeat(40))
}

const isMochaContext = (obj: any): boolean => {
  return typeof obj.test === 'object';
}

const isMochaTest = (obj: any): boolean => {
  return typeof obj.titlePath === 'function' && typeof obj.title === 'string';
}

function wrapErrCtx(test: Mocha.Context, ctx: any, done: Mocha.Done, cb: Function): void;
function wrapErrCtx(test: Mocha.Runnable, ctx: any, done: Mocha.Done, cb: Function): void;
function wrapErrCtx(test: Mocha.Runnable | Mocha.Context, ctx: any, done: Mocha.Done, cb: Function): void {

  try {
    cb();
    done();
  } catch (e) {
    let currentTest: Mocha.Runnable = null;

    if (isMochaContext(test)) {
      currentTest = (test as Mocha.Context).test;
    } else if (isMochaTest(test)) {
      currentTest = (test as Mocha.Runnable);
    } else {
      console.error('wrapErrCtx: Found neither Mocha.Test or Mocha.Context');
      return done(e);
    }

    addContext(currentTest.ctx, {
      title: `Context for ${currentTest.title}`,
      value: ctx
    });

    logContext(currentTest.titlePath()?.join(' / '), ctx);

    done(e);
  }
}

export { wrapErrCtx };

export const wrap = function(ctx: any, cb: Function) {
  let test = this.test;
  return function (done) {
    wrapErrCtx(test, ctx, done, cb);
  }
}

export const planEach = <T>(
  expectedCount: number,
  items: T[],
  testFn: (item: T) => void) => {
  let count = 0;

  items.forEach(item => {
    testFn(item);
    count++;
  });

  expect(count).to.eq(expectedCount,
    `Expected ${expectedCount} tests; found ${count}`);

}
