import { AccessNode, DomAdapter } from '../../src/dom/index.js';
import { expect } from 'chai';

const expectToExist = (el, q, msg?: string) => {
  expect(el).to.not.eq(null, msg || `expected to find one element matching "${q}" in dom`);
}

const expectToNotExist = (els: any[] = [], q: string, msg?: string) => {
  expect(els).to.have.length(0,
    msg || `expected to find no elements matching "${q}" in DOM; found ${els.length}`);
}


export default function DomAssertions(doc: DomAdapter) {

  let chainable = function (el: AccessNode) {
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
    noneExist(q: string, msg?: string) {
      let els = doc.query(q);
      expectToNotExist(els, q, msg);
    }
  }
}