import mapElements from '../../src/tasks/map-elements.js';
import { getTagSelector } from '../../src/tag.js';
import { JSDOM } from 'jsdom';



import { expect } from 'chai';


const getDOM = fragment => {
  let inputDom = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
    </head>
    <body>
      ${fragment}
    </body>
  </html>`;

  return new JSDOM(inputDom, { includeNodeLocations: true });
}


describe('MapElements', function () {
  describe('basic element and class transform', function() {

    let config = {
      name: "Convert heading classes to heading elements",
      task: "map-elements",
      selector: "p.h3, p.h4, p.h5",
      args: [ {
        "p.h3": "h3",
        "p.h4": "h4|other",
        "p.h5": "h5|all"
      } ]
    }

    let task = mapElements(config);

    let fragment = `<div id="test-fragment">
      <p class="h3 ex1">Lorem ipsum</p>
      <p class="h4 ex1">Lorem ipsum</p>
      <p class="h5 ex1">Lorem ipsum</p>
    </div>`;

    let dom = getDOM(fragment);
    let $ = dom.window.document;
    let nodes = $.querySelectorAll(config.selector);

    let results = Array.from(nodes)
      .map(n => task.transform($, n))
      .map(r => {
        if (r.replace.length < 1) {
          expect.fail('task returned no replace results');
        }
        return r.replace[0];
      })
      .map(r => ([ getTagSelector(r[0]), getTagSelector(r[1]) ]));

    it('Returns 3 replace results', function() {
      expect(results).to.have.length(3);
    });

    it('Converts from one element to another', function () {
      expect(results[0]).to.have.property(0, 'p.h3.ex1')
      expect(results[0]).to.have.property(1, 'h3')
    });

    it('Preserves the non-matching CSS classes', function() {
      expect(results[1]).to.have.property(0, 'p.h4.ex1')
      expect(results[1]).to.have.property(1, 'h4.ex1')
    });
    
    it('Preservecs all CSS classes', function() {
      expect(results[2]).to.have.property(0, 'p.h5.ex1')
      expect(results[2]).to.have.property(1, 'h5.h5.ex1')
    });
  });
});