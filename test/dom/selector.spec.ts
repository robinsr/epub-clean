import { expect } from 'chai';

import { describe, it } from 'mocha';
import { isValidSelector } from '../../src/dom/index.js';
import {clamp, range, times} from "remeda";



let css = {
  basic: {
    wildcard: '*',
    type: [ 'p', 'div', 'span', 'h1', 'h2' ],
    class: '.some-class-name',
    id: '#some-id'
  },
  attributeSelectors: {
    // TODO
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
  }
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



let vals = arr => Object.values(arr);

describe('dom/selector', () => {
  describe('#isValidSelector', () => {
    describe('basic', () => {
      it('should throw for invalid', () => {
        query('@#$%^&^%$#$%^', INVALID);
      });
      it('should not throw for any basic selectors', () => {
        basics.forEach(sel => query(sel, VALID));
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

          let psuedo = vals(css.userActionPseudoClasses);
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
});
