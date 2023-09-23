import StringAdapter from '../string-adapter.js';
import JSDOMAdapter from '../../src/dom/adapter/jsdom-adapter.js';
import groupElements from '../../src/tasks/group-elements.js';

import { expect } from 'chai';

import { describe, it } from 'mocha';


const getTask = (name, selector, args) => ({
  name, selector, task: 'group-elements', map: args
})

const setupTest = (taskConfig, fragment) => {
  let { selector, parse, transform } = groupElements.configure(taskConfig);
  let parsed = parse(taskConfig);
  let adapter = JSDOMAdapter(StringAdapter(fragment));
  let nodes = adapter.query(selector);
  let results = nodes.map(n => transform(parsed, n, adapter));

  return { adapter, nodes, results };
}



describe('Tasks#GroupElements', () => {
  describe('it returns an error for mismatched args', function() {
    let taskConfig = {
      task: 'group-elements',
      name: 'Converts p.list-items to a proper unordered-list',
      selector: 'p.list-item',
      wrapper: 'ul.new-list-elem',
      map: {
        'p.list-item': 'li'
      }
    };

    let fragment = `<div id="test-fragment">
      <p class="some-text">Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p class="list-item">1st item in 1st list</p>
      <p class="list-item">2nd item in 1st list</p>
      <p class="list-item">3rd item in 1st list</p>
      <p class="some-text">Ab culpa impedit iusto molestiae necessitatibus quaerat quod soluta veniam vitae voluptas.</p>
      <p class="list-item">1st item in 2nd list</p>
      <p class="list-item">2nd item in 2nd list</p>
      <p class="some-text">Aliquam consectetur culpa et id ipsam molestiae natus sint voluptatibus?</p>
    </div>`

    it('might work', function () {
      let { results } = setupTest(taskConfig, fragment);
      expect(results[0]).to.have.property('error');
      console.log(results[0])
    });
  });
});
