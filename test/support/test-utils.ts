import { inspect as nodeInspect } from 'node:util';
import { Test } from 'mocha';
import colors from 'colors';

export const inspect = (obj: any) => {
  console.log(nodeInspect(obj, { depth: 12 }));
}

export const logContext = (test: Mocha.Runnable, ctx: any) => {
  console.error('='.repeat(40))
  console.error('Context for failed test:', test.titlePath().join(' / ').cyan);
  console.error(nodeInspect(ctx, { depth: 12 }));
  console.error('='.repeat(40))
}

type fn = () => any;

export const wrapErrCtx = (test: Mocha.Runnable, ctx: any, done: Mocha.Done, cb: fn) => {
  try {
    cb();
    done();
  } catch (e) {
    logContext(test, ctx);
    done(e);
  }
}
