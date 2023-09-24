import { expect } from 'chai';
import { setupTest } from "../support/task-setup.js";
import DomHelp from "../support/dom-assertions.js";

import mapElements from '../../src/tasks/map-elements.js';


const getTask = (name, selector, args) => ({
  name, selector, task: 'map-elements', map: args
});

describe('Tasks - MapElements', function () {
  context('With invalid args', function () {
    let taskConfig = {
      task: 'map-elements',
      name: 'This task does not computed',
      selector: 'p.awesome-text',
      map: {
        'img.awesome-image': 'div.image-removed',
        'small': 'what|does|this|do?'
      }
    }

    let fragment = `<div id="test-fragment">
      <p class="awesome-text">Lorem ipsum</p>
    </div>`

    let { results, adapter } = setupTest(mapElements, taskConfig, fragment);

    describe('Task selector and map selectors conflict', function () {
      it('should return an error', function () {
        expect(results[0]).to.have.property('error').that.not.eq(null);
      });
    })
  });

  context('With valid args', function () {
    describe('Maps [typeA].[class] to [typeB]', function () {
      let taskConfig = getTask(
        'Convert p.[h-class] to <[h-class]>',
        'p.h3, p.h4, p.h5',
        {
          'p.h3': 'h3',
          'p.h4': 'h4|other',
          'p.h5': 'h5|all'
        });

      let fragment = `<div id="test-fragment">
      <p class="h3 ex1"
        epub:type=""
        aria-label="h3-ARIA-Label">h3 Lorem ipsum</p>
      <p class="h4 ex1">h4 Lorem ipsum</p>
      <p class="h5 ex1">h5 Lorem ipsum</p>
    </div>`;

      let { adapter: doc, results } = setupTest(mapElements, taskConfig, fragment);
      //console.log(doc.body)
      let dom = DomHelp(doc);
      let same_text = 'expected text to not be altered';

      it('should not error', function () {
        expect(results).to.not.have.property('error');
      });

      it('should make 3 updates to DOM', function () {
        dom.noneExist('p', 'All <p> should have been replaced');
      });

      it('should remove all old css classes', function () {
        dom.exists('h3').and
          .have.property('classList')
          .with.all.members([], 'there should be no classes on this h3')
      });

      it('should keep non-matching css classes when "other" flag present', function () {
        dom.exists('h4').and
          .have.property('classList')
          .with.all.members(['ex1']); // only non-matching classes
      });

      it('should keep all css classes when "all" flag present', function () {
        dom.exists('h5').and
          .have.property('classList')
          .with.all.members(['h5', 'ex1']); // all previous classes
      });

      it('should not modify element contents', function () {
        dom.exists('h3').and
          .has.property('text').that.matches(/^h3 Lorem ipsum$/, same_text);

        dom.exists('h4.ex1').and
          .has.property('text').that.matches(/^h4 Lorem ipsum$/, same_text);

        dom.exists('h5.h5.ex1').and
          .has.property('text').that.matches(/^h5 Lorem ipsum$/, same_text);
      });

      it('should preserve non-class attributes', function () {
        dom.exists('h3').and
          .has.property('attrs')
          .that.has.property('aria-label')
          .that.eq('h3-ARIA-Label', 'aria-label was not preserved');
      });
    });

    describe('Maps [attr] to [type].[class]', function () {
      let taskConfig = getTask(
        'Attribute selectors',
        ':not([class]), :not([id])',
        {
          'div:not([class])': 'div.no-initial-class',
          'div:not([id])': 'div.no-initial-id|all',
        });

      let fragment = `
        <div class="pre-class">
          <p>I have no ID</p>
        </div>
        <div id="pre-id">
          <p>I have no class</p>
        </div>`;

      let { adapter: doc, results} = setupTest(mapElements, taskConfig, fragment);
      let dom = DomHelp(doc);

      it('should not error', function () {
        expect(results).to.not.have.property('error');
      });

      it('should apply classname "has-no-class" to any paragraph without', function () {
        dom.exists('div.pre-class').and
          .has.property('classList')
            .with.all.members(['no-initial-id', 'pre-class']);

        dom.exists('div.pre-class').and
          .has.property('text').that.contain('I have no ID');

        dom.exists('div#pre-id').and
          .have.property('classList')
          .with.all.members(['no-initial-class']);

        dom.exists('div#pre-id').and
          .has.property('text').that.contain('I have no class')
      });
    });

    // duplicate test
    describe.skip('basic element and class transform', function () {
      let taskConfig = getTask(
        'Convert p.[h-class] to <[h-class]>',
        '.ugly-text',
        {
          'p.h3': 'h3',
          'p.h4': 'h4|other',
          'p.h5': 'h5|all',
          'p': 'p.should-not-be-in-final-dom'
        });

      let fragment = `<div id="test-fragment">
        
      </div>`;

      let { adapter: doc, results } = setupTest(mapElements, taskConfig, fragment);
      let dom = DomHelp(doc);

      it('Does not error', function () {
        expect(results).to.not.have.property('error');
      });

      it('Returns 3 replace results', function () {
        expect(results).to.have.length(3);
      });

      it('Converts from one element to another', function () {

      });
    });
  });
});