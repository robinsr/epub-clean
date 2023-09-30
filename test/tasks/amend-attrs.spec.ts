import AmendAttrs from '../../src/tasks/amend-attrs.js';
import { setupTest } from '../support/task-setup.js';
import { AmendAttrArgs } from '../../src/tasks/tasks.js';
import { wrapErrCtx } from '../support/test-utils.js';
import { expect } from 'chai';


describe('Tasks - AmendAttributes', () => {
  describe('with invalid arguments', () => {
    it('returns validation errors', done => {


      let invalid_args: AmendAttrArgs = {
        task: AmendAttrs.type,
        name: 'string values mismatch',
        selector: 'p.tx',
        attrs: [ {
          op: 'replace',
          attr: 'class',
          // @ts-ignore
          values: 'some-class-name'
        } ]
      }


      let {taskDef} = setupTest(AmendAttrs, invalid_args, '');
      let errors = taskDef.validate(invalid_args);

      wrapErrCtx(this, errors, done, () => {
        expect(errors).to.not.be.null;
      })
    })
  })
});