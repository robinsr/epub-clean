import { AccessNode, DomAdapter } from '../../src/dom/index.js';
import { expect } from 'chai';

const expectToExist = (el, q, msg?: string) => {
  expect(el).to.not.eq(null, msg || `expected to find one element matching "${q}" in dom`);
}

const expectNumberToExist = (els, n, q) => {
  expect(els).to.be.a('array', `expected to get an array of results for selector ${q}`);
  expect(els).to.have.length(n, `expected to find ${n} elements matching "${q}" in dom`);
}

const expectToNotExist = (els: any[] = [], q: string, msg?: string) => {
  expect(els).to.have.length(0,
    msg || `expected to find no elements matching "${q}" in DOM; found ${els.length}`);
}

export interface Chainable {
  and: Chai.Assertion
}

export interface DomAssertions {
  exists(q: string, msg?: string): Chainable;
  allExists(q: string, n: number): Chainable;
  noneExist(q: string, msg?: string): void;
}


export default function DomAssertions(doc: DomAdapter): DomAssertions {

  let chainable = function (el: AccessNode | AccessNode[]): Chainable {
    return {
      // give access to chai chain
      get and() {
        return expect(el);
      }
    }
  }

  return {
    exists(q: string, msg?: string) {
      let el = doc.first(q);
      expectToExist(el, q, msg);
      return chainable(el);
    },
    allExists(q: string, n: number) {
      let els = doc.query(q);
      expectNumberToExist(els, n, q);
      return chainable(els);
    },
    noneExist(q: string, msg?: string) {
      let els = doc.query(q);
      expectToNotExist(els, q, msg);
    }
  }
}
