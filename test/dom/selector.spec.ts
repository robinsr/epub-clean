import {
  isValidSelector,
  getNamespaces,
  parseSelector,
  removeNamespaces,
  sortSelectors
} from '../../src/dom/index.js';
import {clamp, range, times, values} from "remeda";
import { describe, it } from 'mocha';
import { expect } from 'chai';
import { parseSelectorV2 } from '../../src/dom/selector.js';


const css = {
  basic: {
    wildcard: '*',
    type: [ 'p', 'div', 'span', 'h1', 'h2' ],
    class: '.some-class-name',
    id: '#some-id'
  },
  attributeSelectors: {
    // TODO - Test attribute selectors
    attrExists: '[attributename]',
    attrEquals: '[attributename=value]',
    attrListContains: '[attributename~=value]',
    attrStartsWith: '[attributename^=value]',
    attrEndsWith: '[attributename$=value]',
    attrDashWith: '[attributename|=value]',
    attrContains: '[attributename*=value]',
  },
  pseudoElements: {
    firstLine: '::first-line',
    firstLetter: '::first-letter',
    selection: '::selection',
    after: '::after',
    before: '::before',
    placeholder: '::placeholder',
  },
  inputPseudoClasses: {
    disabled: ':disabled',
    enabled: ':enabled',
    checked: ':checked',
    readOnly: ':read-only',
    placeholderShown: ':placeholder-shown',
    outOfRange: ':out-of-range',
    required: ':required',
  },
  // not really releveant for this project
  userActionPseudoClasses: {
    link: ':link',
    hover: ':hover',
    visited: ':visited',
    active: ':active'
  },
  structuralPseudoClasses: {
    firstChild: ':first-child',
    nthChild: ':nth-child($n)',
    lastChild: ':last-child',
    nthLastChild: ':nth-last-child($n)',
    onlyChild: ':only-child',
    firstOfType: ':first-of-type',
    nthOfType: ':nth-of-type($n)',
    lastOfType: ':last-of-type',
    nthLastOfType: ':nth-last-of-type($n)',
  },
  combinators: {
    descendent: ' ',
    child: '>',
    nextSibling: '+',
    following: '~'
  },
  namespaces: 'this|that|the-other-thing',
  big_selector: 'div#doc-root>.section[epub:type*=chap]+a:visited'
}

const unexpected = sel => `Unexpected result for selector "${sel}"`;

const query = (s, isValid = true) => {

  expect(isValidSelector(s)).to.be.eq(isValid, unexpected(s))
}

const VALID = true;
const INVALID = false;

let basics = [
  css.basic.wildcard,
  css.basic.class,
  css.basic.id,
  ...css.basic.type
];

// makes an array of length (n) of random numbers, clamped by (l)
let randoms = (n: number, l: number): number[] => {
  return range(0, n).map(i => (Math.floor(Math.random() * l)) % l);
}

// gets a random item from an array
let spin = <T> (arr: T[]): T => {
  return arr.at((Math.floor(Math.random() * arr.length)) % arr.length);
}

// does a random thing every once in a while...
// if unlucky, you still get your T back
let dice = <T, C = T> (chance: number, item: T, doToItem: (t:T) => C): T|C => {
  return randoms(1, 100)[0] > clamp(chance, {max:100}) ? doToItem(item) : item;
}

// joins the members of an array using a supplied bottle of glue
let glue = (members: string[], moreglue: () => string): string => {
  return members.reduce((i, m) => i + m + moreglue(), moreglue())
}

// inner-joins of the members of an array using a supplied bottle of glue
let glueIn = (members: string[], moreglue: () => string): string => {
  return members.slice(1).reduce((i, m) => i + moreglue() + m, members[0])
}

describe('DOM - selector', () => {
  describe('#isValidSelector', () => {
    describe('basic', () => {

      it('should throw for an invalid selector', () => {
        query('@#$%^&^%$#$%^', INVALID);
      });

      it('should not throw for any basic selectors', () => {
        basics.forEach(sel => query(sel, VALID));
      });

      it('should ignore any trailing namespace', () => {

        let test_selectors = [
          'p.some-text|qwerty',
          'p.some-text|' + css.namespaces,
        ]

        test_selectors.forEach(sel => query(sel, VALID));
      });
    });

    describe('combinators', () => {
      let combos = [
          css.combinators.child,
          css.combinators.descendent,
          css.combinators.following,
          css.combinators.nextSibling
        ];

      describe('basic combinator', () => {
        // the min/max size of selector
        let variance = range(2, 6);
        let test_count = 9;

        let make_selectors = () => {
          let c = range(0, spin(variance)).map(n => spin(combos));
          let sel = glue(c, () => spin(basics));

          let ts = range(0, spin(variance)).map(n => spin(css.basic.type));
          let tsel = glueIn(ts, () => spin(c));

          return [sel, tsel];
        }

        times(make_selectors)(test_count).flat().forEach(sel => {
          it(`should validate the selector ${sel}` + sel, () => {
            query(sel, VALID);
          });
        });
      });

      describe('user-action psuedo-elements', () => {
        let variance = range(2, 6);
        let test_count = 7;

        let make_selectors = () => {
          let c = range(0, spin(variance)).map(n => spin(combos));
          let sel = glue(c, () => spin(basics));

          let psuedo = values(css.userActionPseudoClasses);
          let ts = range(0, spin(variance))
            .map(n => dice(30, spin(css.basic.type), t => t + spin(psuedo)));

          let tsel = glueIn(ts, () => spin(c));

          return [sel, tsel];
        }

        times(make_selectors)(test_count).flat().forEach(sel => {
          it(`should validate the selector ${sel}` + sel, () => {
            query(sel, VALID);
          });
        });
      });
    });
  });


  describe('#getNamespaces', () => {
    it('return any namespaces from selector strings', () => {
      let result = getNamespaces(`${css.big_selector}|${css.namespaces}`);

      expect(result).to.be.a('array');
      expect(result).to.have.length(3);

      css.namespaces.split('|').forEach((ns, i) => {
        expect(result[i]).to.eq(ns);
      });
    });
  });

  describe('#removeNamespaces', () => {
    it('should remove trailing namespaces from selector strings', () => {
      let result = removeNamespaces(`${css.big_selector}|${css.namespaces}`);

      expect(result).to.be.a('string');
      expect(result).to.eq(css.big_selector);
    });
  });


  describe('#parseSelector', () => {
    let tag = 'p';
    let classList = [ 'a-cls', 'b-cls' ];
    let selector = `${tag}.${classList.join('.')}|${css.namespaces}`

    it('should return the tag name', () => {
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('tag', 'p')
    });

    it('should return the classlist', () => {
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('classList');
      expect(results.classList).to.be.an('array')
        .that.has.all.members(classList);
    });

    it('should return the namespaces', () => {
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('namespaces');
      expect(results.namespaces).to.be.an('array')
        .that.has.all.members(css.namespaces.split('|'));
    });

    it('should return values false for "preserveAll" and "preserveOther', () => {
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('preserveAll', false);
      expect(results).to.have.property('preserveOther', false);
    });

    it('should return true values for "preserveAll"', () => {
      let selector = `${tag}.${classList.join('.')}|all`
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('preserveAll', true);
    });

    it('should return true values for "preserveOther"', () => {
      let selector = `${tag}.${classList.join('.')}|other`
      //let results = parseSelector(selector);
      let results = parseSelector(selector);
      expect(results).to.be.a('object');
      expect(results).to.have.property('preserveOther', true);
    });
  });

  describe('#parseSelectorV2', function () {
    it('should do something Im not sure what yet', () => {
      let results = parseSelectorV2('+ div');
      expect(results).to.be.a('object');

      results = parseSelectorV2('div + span');
      expect(results).to.be.a('object');

      results = parseSelectorV2('~ div.sib p span ul li')
      expect(results).to.be.a('object');
    });
  });

  describe('#sortSelectors', () => {
    it('should sort the list, with more specific selectors first', () => {
      let selectors = [
        'p.cl1',
        'p.cl1#idA',
        'p.cl1.cl2.cl3.cl4',
        '*',
        'p#id1 p#id2',
        'p.cl1 p#id2',
        'p',
        'p.cl1.cl2.cl3.cl4.cl5',
        'p[thing^="abc"]',
        'p.cl1.cl2',
        'p>span~div p~h1>.some-class-name',
      ];

      let expected = [
        'p#id1 p#id2',
        'p.cl1 p#id2',
        'p.cl1#idA',
        'p.cl1.cl2.cl3.cl4.cl5',
        'p.cl1.cl2.cl3.cl4',
        'p.cl1.cl2',
        'p>span~div p~h1>.some-class-name',
        'p[thing^="abc"]',
        'p.cl1',
        'p',
        '*',
      ]

      let results = sortSelectors(selectors);

      expected.forEach((ex, i) => {
        expect(results.at(i)).to.eq(ex);
      });
    });
  });
});