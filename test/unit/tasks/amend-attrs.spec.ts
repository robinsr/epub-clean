import AmendAttrs from '../../../src/tasks/amend-attrs.js';
import { AmendAttrArgs, AmendAttrOp, ValidationResult } from '../../../src/tasks/tasks.js';
import { setupTest } from '../support/task-setup.js';
import { wrap, wrapErrCtx } from '../support/test-utils.js';
import { expect } from 'chai';
import DomAssertions from '../support/dom-assertions.js';

const argMaker = (name: string, selector: string) => {
  return (attrs: AmendAttrOp): AmendAttrArgs => {
    return {
      task: AmendAttrs.type,
      name, selector, attrs: [ attrs ]
    }
  }
};

const matchValidationErrs = (errors: ValidationResult, expected: object) => {
  expect(errors, 'Not all expected validation errors present')
    .to.have.all.keys(Object.keys(expected));

  Object.keys(expected).forEach(keyA => {
    expect(errors).to.have.property(keyA);

    Object.keys(expected[keyA]).forEach(keyB => {
      expect(errors).to.have.nested.property(
        `${keyA}.${keyB}`, expected[keyA][keyB], `Wrong value for key "${keyA}.${keyB}"`
      );
    });
  });
}


describe('Tasks - AmendAttributes', function () {
  describe('operation: regex', function () {
    describe('with invalid arguments', function () {
      let testName = 'invalid-regex-args';
      it('should complain about missing properties', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'regex', attr: 'class', values: 'some-class-name'
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.not.be.null;

          matchValidationErrs(errors, {
            match: {
              message: `(${testName}) Property "match" is required for operation "regex"`
            },
            replace: {
              message: `(${testName}) Property "replace" is required for operation "regex"`
            },
            values: {
              problem: 'object.unknown'
            }
          });
        });
      });
    });

    describe('with valid arguments', function () {
      let testName = 'valid-regex-args';
      let args = argMaker(testName, 'p[class^=css-lib-]')({
        op: 'regex',
        attr: 'class',
        match: 'css-lib-\w+',
        replace: ''
      });

      let test_fragment = `
        <p class="keep-A css-lib-X keep-B">Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
        <p class="keep-C css-lib-Y keep-D">Accusantium eligendi exercitationem facere fugiat hic, illum iusto laborum maiores mollitia</p>
        <p class="keep-C css-lib-Z keep-D">nam necessitatibus odit placeat sed veritatis voluptates? At quidem quisquam veritatis.</p>
      `;

      let { taskDef, adapter: doc } = setupTest(AmendAttrs, args, test_fragment);
      let errors = taskDef.validate(args);
      let dom = DomAssertions(doc);

      it('should validate successfully', function (done) {
        wrapErrCtx(this.test, errors, done, () => {
          expect(errors, 'Did not expect errors in this test').to.be.null;
        });
      });

      it('should do other things', function (done) {
        wrapErrCtx(this, errors, done, () => {
          expect(errors, 'Did not expect errors in this test').to.be.null;
        });
      });
    });
  });

  describe('operation: add', function () {
    describe('with invalid arguments', function () {
      let testName = 'invalid-add-args';
      it('should not allow empty string for value', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'add', attr: 'class', value: ''
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.not.be.null;

          matchValidationErrs(errors, {
            value: {
              message: `(${testName}) Property "value" cannot be empty. Did you mean to use operation "remove"`
            }
          });
        });
      });
    });

    describe('with valid arguments', function () {
      let testName = 'valid-add-args';
      it('should validate successfully', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'add', attr: 'class', value: 'special-text'
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.be.null;
        });
      });
    });
  });

  describe('operation: remove', function () {
    describe('with invalid arguments', function () {
      let testName = 'invalid-remove-args';
      it('should not allow value', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'remove', attr: 'class', value: 'some-class-I-meant-to-add'
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.not.be.null;

          matchValidationErrs(errors, {
            value: {
              message: `(${testName}) Property "value" is not needed for operation "remove"`
            }
          });
        });
      });
    });

    describe('with valid arguments', function () {
      let testName = 'valid-remove-args';
      it('should validate successfully', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'remove', attr: 'class'
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.be.null;
        });
      });
    });
  });

  describe('operation: replace', function () {
    describe('with invalid arguments', function () {
      let testName = 'invalid-replace-args';
      it('should not allow empty string for value', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'replace', attr: 'class', value: ''
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.not.be.null;

          matchValidationErrs(errors, {
            value: {
              message: `(${testName}) Property "value" cannot be empty. Did you mean to use operation "remove"`
            }
          });
        });
      });
    });

    describe('with valid arguments', function () {
      let testName = 'valid-replace-args';
      it('should validate successfully', function (done) {
        let args = argMaker(testName, 'p.tx')({
          // @ts-ignore
          op: 'replace', attr: 'id', value: 'special-text'
        });

        let {taskDef} = setupTest(AmendAttrs, args, '');
        let errors = taskDef.validate(args);

        wrapErrCtx(this.test, errors, done, function () {
          expect(errors).to.be.null;
        });
      });
    });
  });
});