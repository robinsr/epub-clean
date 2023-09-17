import StringAdapter from '../string-adapter.js';
import JSDOMAdapter from '../../src/dom/adapter/jsdom-adapter.js';
import mapElements from '../../src/tasks/map-elements.js';

import { expect } from 'chai';

const props = (obj) => {
  console.log(Object.getOwnPropertyNames(obj));
}

const getTask = (name, selector, args) => ({
  name, selector, task: 'map-elements', args: [ args ]
})

const setupTest = (taskConfig, fragment) => {
  let task = mapElements(taskConfig);
  let adapter = JSDOMAdapter(StringAdapter(fragment));
  let nodes = adapter.query(task.selector);
  let results = nodes.map(n => task.transform(n, adapter));

  return { task, adapter, nodes, results };
}

describe('MapElements', function () {
  describe('basic element and class transform', function() {

    let taskConfig = getTask(
      'Convert p.[h-class] to <[h-class]>',
      'p.h3, p.h4, p.h5',
      {
        'p.h3': 'h3',
        'p.h4': 'h4|other',
        'p.h5': 'h5|all'
      });

    let fragment = `<div id="test-fragment">
      <p class="h3 ex1">Lorem ipsum</p>
      <p class="h4 ex1">Lorem ipsum</p>
      <p class="h5 ex1">Lorem ipsum</p>
    </div>`;

    let expected = [
      [ 'p.h3.ex1', 'h3' ],
      [ 'p.h4.ex1', 'h4.ex1' ],
      [ 'p.h5.ex1', 'h5.h5.ex1' ]
    ];

    let { results } = setupTest(taskConfig, fragment);

    it('Does not error', function() {
      expect(results).to.not.have.property('error');
    });

    it('Returns 3 replace results', function() {
      expect(results).to.have.length(3);
      expect(results[0]).to.have.property('replace');
      expect(results[1]).to.have.property('replace');
      expect(results[2]).to.have.property('replace');
    });

    it('Converts from one element to another', function () {
      let replace = results[0].replace;

      results.map(r => r.replace[0])
        .forEach((replace, i) => {
          expect(replace).to.have.length(2);
          
          let [ before, after ] = replace;
          
          expect(before.selector).to.equal(expected[i][0]);
          expect(after.selector).to.equal(expected[i][1]);
      });
    });
  });


  describe('Selects and updates based on CSS attribute selectors', function () {
    let taskConfig = getTask(
      'Property selectors',
      'p:not([class]), p:not([id])',
      {
        'p:not([class])': 'p.has-no-class',
        'p:not([id])': 'p.has-no-id',
      });

    let fragment = `<div id="test-fragment">
      <p class="p-class">I have no ID</p>
      <p id="p-id">I have no class</p>
    </div>`;

    let expected = [
      [ 'p.p-class', 'p.has-no-id' ],
      [ 'p', 'p.has-no-class' ]
    ];

    let { results } = setupTest(taskConfig, fragment);

    it('Does not error', function() {
      expect(results).to.not.have.property('error');
    });

    it('Applies updates as expected', function () {
      let replace = results[0].replace;

      results.map(r => r.replace[0])
        .forEach((replace, i) => {
          expect(replace).to.have.length(2);
          
          let [ before, after ] = replace;
          
          expect(before.selector).to.equal(expected[i][0]);
          expect(after.selector).to.equal(expected[i][1]);
      });
    });
  });
});