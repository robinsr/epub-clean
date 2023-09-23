import { expect } from 'chai';
import { describe, it } from 'mocha';

import { taskSchema, validators, validateSchema } from '../../src/tasks/task-config.js';


const valid_task = {
  name: 'Change text case on p.text',
  selector: 'p.text',
  task: 'change-case'
};

const invalid_task = {
  name: '',
  selector: '!@#$ not a CSS Selector ^&*(',
  task: 'not-a-real-task-name'
}


describe('task-config', function() {
  describe('validate task schema', function() {
    it('returns the validation err type as "problem"', function () {
      let errors = validateSchema(taskSchema, invalid_task);

      expect(errors).to.be.an('object');
      expect(errors).to.nested.include({
        'name.problem': 'string.empty',
        'selector.problem': 'selector.invalid',
        'task.problem': 'any.only'
      });
    });

    it('returns validation messages', function() {
      let errors = validateSchema(taskSchema, invalid_task);
      expect(errors).to.be.an('object');
      expect(errors).to.have.all.keys('name', 'selector', 'task');
      expect(errors).to.nested.property('name.message').is.a('string');
      expect(errors).to.nested.property('selector.message').is.a('string');
      expect(errors).to.nested.property('task.message').is.a('string');
    });

    it('includes the optional label in validation messages', function() {
      let LABEL_VAL = 'mocha-test';
      let errors = validateSchema(taskSchema, invalid_task, LABEL_VAL);
      expect(errors).to.be.an('object');
      expect(errors).to.have.all.keys('name', 'selector', 'task');
      expect(errors).to.nested.property('name.message').to.contain(LABEL_VAL)
      expect(errors).to.nested.property('selector.message').to.contain(LABEL_VAL)
      expect(errors).to.nested.property('task.message').to.contain(LABEL_VAL)
    });

    it('returns no errors for valid task', function () {
      let errors = validateSchema(taskSchema, valid_task, 'mocha-test');
      expect(errors).to.be.null;
    })
  });

  describe('#validators', function() {
    describe('#validators.elementMap()', function () {
      let test_name = 'elem-map-test';
      let test_schema = validators
          .object({ map: validators.elementMap() })

      it('should accepts valid CSS selectors as keys and values', function() {
        let valid_map = {
          'p.h2': 'h2',
          'p.h3': 'h3|all',
          'p.h4': 'h4|other',
          'p.h5a, p.h5b': 'h5|other',
          'p:not([hidden])': 'p.not-hidden',
          'p[hidden]': 'p.hidden'
        };

        let errors = validateSchema(test_schema, { map: valid_map }, test_name);

        expect(errors).to.be.null;
      });

      it('should reject valid strings that are not valid CSS selectors', function() {
        let invalid_map = {
          'p:not([hidden])': 'p.valid-key',
          'p.valid-value': 'h2',
          '<!--bad-key--->': 'p.invalid-key',
          '((((bad-key))))': 'p.invalid-key',
          'p.invalid-value-1': '<!--bad-value--->',
          'p.invalid-value-2': '((((bad-value))))',
          '<!--both-invalid-->': '((((both-invalid))))'
        }

        let expectedProblems = {
           '<!--bad-key--->': 'object.unknown',
          '((((bad-key))))': 'object.unknown',
          'p.invalid-value-1': 'selector.invalid',
          'p.invalid-value-2': 'selector.invalid',
          '<!--both-invalid-->': 'object.unknown'
        };

        let errors = validateSchema(test_schema, { map: invalid_map }, test_name);

        expect(errors).to.be.a('object');
        expect(errors).to.have.all.keys(...Object.keys(expectedProblems));
        Object.entries(expectedProblems).forEach(([key, problem]) => {
          expect(errors).to.have.property(key).with.property('problem', problem);
        });
      });

      it('should reject keys/values non-string types', function() {
        let test_map = {
          1234: 'number-key',
          'number-value': 1234,
          'bool-value': true,
          'array-value': [1,2,3],
          'map-value': { name: 'muffin man'},
          '': 'empty-key',
          'empty-value': '',
          'null-value': null,
        };

        let expectedProblems = {
          '1234': 'object.unknown',
          '': 'object.unknown',
          'number-value': 'string.base',
          'bool-value': 'string.base',
          'array-value': 'string.base',
          'map-value': 'string.base',
          'null-value': 'string.base',
          'empty-value': 'string.empty',
        };

        let errors = validateSchema(test_schema, { map: test_map }, test_name);

        expect(errors).to.be.a('object');
        expect(errors).to.have.all.keys(...Object.keys(expectedProblems));
        Object.entries(expectedProblems).forEach(([key, problem]) => {
          expect(errors).to.have.property(key).with.property('problem', problem);
        });
      });
    })
  })
})
