import groupElements from '../../../src/tasks/group-elements.js';
import { setupTest } from "../support/task-setup.js";
import DomHelp, { DomAssertions } from '../support/dom-assertions.js';
import { inspect, wrapErrCtx } from '../support/test-utils.js';

import { expect } from 'chai';
import { before, describe, it } from 'mocha';

const invalids = {
  selector: '$$^^&&^^$$',
  noTag: '.im-just-a-class'
}


describe('Tasks - GroupElements', function () {

  describe('Validates schema', () => {

    let jsonConfig = {
      task: groupElements.type,
      name: 'validation-test',
      selector: 'div',
      map: undefined,
      wrapper: '',
    }

    it('should require "wrapper" to be a non-empty string', function (done) {
      let errors = groupElements
        .configure(jsonConfig)
        .validate(jsonConfig);

      wrapErrCtx(this.test, errors, done, () => {
        expect(errors).to.have.property('wrapper');
        expect(errors).to.have.nested.property('wrapper.problem')
          .that.eq('string.empty');

        expect(errors).to.have.nested.property('wrapper.message')
          .that.matches(/^\(group-elements\)/);
      });
    });

    it('should require "wrapper" to be a valid css string', function (done) {
      let config = { ...jsonConfig, wrapper: invalids.selector };
      let errors = groupElements
        .configure(config)
        .validate(config);

      wrapErrCtx(this.test, errors, done, () => {
        expect(errors).to.have.property('wrapper');
        expect(errors).to.have.nested.property('wrapper.problem')
          .that.eq('selector.invalid');
      });
    });

    it('should require "wrapper" css string to include a tag', function (done) {
      let config = { ...jsonConfig, wrapper: invalids.noTag };
      let errors = groupElements
        .configure(config)
        .validate(config);

      wrapErrCtx(this.test, errors, done, () => {
        expect(errors).to.have.property('wrapper');
        expect(errors).to.have.nested.property('wrapper.problem')
          .that.eq('selector.needsTag');
      });
    });
  });

  describe('Groups adjacent elements matching the selector', function () {
    let taskConfig = {
      task: 'group-elements',
      name: 'Converts p.list-items to a proper unordered-list',
      selector: 'p.tx.special',
      wrapper: 'div.special-text',
      map: {
        'p.tx.special': 'p|all'
      }
    };

    let fragment = `<div id="test-fragment">
      <p class="tx">One - Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p class="tx special">Two - Ab culpa impedit iusto molestiae necessitatibus quaerat quod soluta veniam vitae voluptas.</p>
      <p class="tx">Three - Aliquam consectetur culpa et id ipsam molestiae natus sint voluptatibus?</p>
    </div>`;

    let { results, config, taskDef, nodes, adapter: doc } = setupTest(groupElements, taskConfig, fragment);
    let dom = DomHelp(doc);

    it('should create 2 new list elements', function (done) {
      wrapErrCtx(this.test, doc.body, done, () => {
        expect(results).to.be.a('array');
        expect(results).to.have.length(1);
        expect(results).to.have.nested.property('[0].docChanges[0]')
          .that.has.property('type', 'REPLACE-NODE');

        dom.exists('div.special-text');
        dom.exists('p.tx.special', doc.body);
      })
    });
  });

  describe('Maps selected elements to new types', function() {
    let taskConfig = {
      task: 'group-elements',
      name: 'Converts p.list-items to a proper unordered-list',
      selector: 'p.dot',
      wrapper: 'ul.new-list',
      map: {
        'p.tx.dot': 'li.newLI|other'
      }
    };

    let fragment = `<div id="test-fragment">
      <p class="tx">Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
      <p class="tx dot ul0 li0">• item 1 in 1st list</p>
      <p class="tx dot ul0 li1">• item 2 in 1st list</p>
      <p class="tx dot ul0 li2">• item 3 in 1st list</p>
      <p class="tx">Ab culpa impedit iusto molestiae necessitatibus quaerat quod soluta veniam vitae voluptas.</p>
      <p class="tx dot ul1 li0">• item 1 in 2nd list</p>
      <p class="tx dot ul1 li1">• item 2 in 2nd list</p>
      <p class="tx">Aliquam consectetur culpa et id ipsam molestiae natus sint voluptatibus?</p>
    </div>`;


    let dom: DomAssertions, doc;
    before(done => {
      let { config, taskDef, nodes, adapter } = setupTest(groupElements, taskConfig, fragment);
      dom = DomHelp(adapter);
      doc = adapter;
      done();
    })

    it('should create 2 new list elements', function (done) {
      wrapErrCtx(this.test, doc.body, done, () => {
        dom.allExists('ul.new-list', 2);
      });
    });

    it('should create child elements in new list elems', function () {
      let [ list1, list2 ] = doc.query('ul.new-list');

      expect(list1).to.have.property('children');
      expect(list1.childCount).to.eq(3);

      expect(list2).to.have.property('children');
      expect(list2.childCount).to.eq(2);
    });

    it('children should be accessible', () => {
      let [list1, list2] = doc.query('ul.new-list');
      expect(list1.children).to.exist;
      expect(list1.children).to.be.a('array');
      expect(list2.children).to.exist;
      expect(list2.children).to.be.a('array');
    });

    it('should create child elements with original content', function () {
      let check_count = 0;

      [ '1st', '2nd' ].forEach((order, list_index) => {
        doc.query(`ul.new-list:nth-of-type(${list_index+1}) li`).forEach((child, child_index) => {
          //console.log(list_index, child_index, child.tagSummary)
          expect(child.tag).to.eq('li');
          expect(child.classList).to.have.all.members(['newLI', `ul${list_index}`, `li${child_index}`])
          expect(child.inner).to.eq(`• item ${child_index+1} in ${order} list`);
          check_count++;
        });
      });

      expect(check_count).to.eq(5, 'Expected to find 5 total list items to check')
    });

    it('does not affect previous content', function () {
      let expected_text = [
        /^Lorem ipsum Lorem.*/,
        /^Ab culpa impedit.*/,
        /^Aliquam consectetur.*/
      ];

      let paras = doc.query('p.tx');
      expect(paras).to.have.length(3);

      let check_count = 0;
      paras.forEach((child, child_i) => {
        expect(child.tag).to.eq('p');
        expect(child.classList).to.have.all.members(['tx'])
        expect(child.text).to.match(expected_text[child_i]);
        check_count++;
      });

      expect(check_count).to.eq(3, 'Expected to find 3 total paragraphs to check')
    });
  });


  describe('Convert p.quote to blockquotes', function() {
    let taskConfig = {
      task: 'group-elements',
      name: 'Convert p.quote to blockquotes',
      selector: 'p.quote',
      wrapper: 'figure',
      map: {
        'p.quote': 'blockquote',
        'p.quote.i': 'blockquote.i',
        'p.quote.i.a.b.c.d': 'blockquote.most-specific',
        'p.quote-src': 'figcaption'
      }
    };

    let fragment = `<div id="test-fragment">
    <p class="tx">Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
    <p class="quote">I'm sick of following my dreams, man. I'm just going to ask where they're going and hook up with ’em later</p>
    <p class="quote-src">Mitch Hedberg</p>
    <p class="quote i a b c d">Clothes make the man. Naked people have little or no influence in society.</p>
    <p class="quote-src">Mark Twain</p>
    <p class="quote">“Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.”</p>
    <p class="quote-src">Albert Einstein</p>
    <p class="tx">Ab culpa impedit iusto molestiae necessitatibus quaerat quod soluta veniam vitae voluptas.</p>
    <p class="quote i">“So <em>many</em> books, so little <em>time</em>.”</p>
    <p class="quote-src">Frank Zappa</p>
    <p class="quote i">“You only live once, but if you do it right, once is enough.”</p>
    <p class="quote-src">Mae West</p>
    <p class="quote">“Work hard in silence, let your success be your noise.”</p>
    <p class="tx">Lorem ipsum Lorem ipsum dolor sit amet, consectetur adipisicing elit.</p>
  </div>`

    let doc = null
    before(done => {
      let {config, taskDef, nodes, adapter} = setupTest(groupElements, taskConfig, fragment);
      doc = adapter;
      done();
    })

    it('should work', () => {
      expect(doc.query('figure').length).to.eq(6,
        'Should be 6 quotes total');

      expect(doc.query('figure > blockquote').length).to.eq(6,
        'All 6 quotes should be blockqoutes in a figure');

      expect(doc.query('figure > blockquote.i').length).to.eq(2,
        '2 of the 6 quotes should have the class "i"');

      expect(doc.query('figure figcaption').length).to.eq(5,
        '5 of the 6 quotes should have figcaptions with quote source');

      expect(doc.query('figure blockquote.most-specific').length).to.eq(1,
        'should apply the most specific matching selector (even if not first in list)');
    });
  });
});
