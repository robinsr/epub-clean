import { Adapter, DomAdapter } from './../dom.js';

import format from "html-format";
import jsdom from 'jsdom';
const { JSDOM } = jsdom;


import JSDOMNode from './jsdom-node.js';

const format_indent = ' '.repeat(4);
const format_width = 2000;


const JSDOMAdapter = (adapter: Adapter): DomAdapter => {
  const contents = adapter.getContents();;
  const dom = new JSDOM(contents, {
    url: 'https://example.org/',
    referrer: 'https://example.com/',
    contentType: 'text/html',
    includeNodeLocations: true,
    storageQuota: 10000000
  });
  const doc = dom.window.document;

  return {
    getContents() {
      return contents;
    },

    get body() {
      return format(dom.window.document.body.outerHTML, format_indent, format_width);
      //return dom.window.document.body.outerHTML;
    },

    query(selector) {
      let nodes = doc.querySelectorAll('body ' + selector);

      return Array.from(nodes).map(node => {
        return JSDOMNode(dom, node as HTMLElement);
      });
    },

    first(selector) {
      let node = doc.querySelector('body ' + selector);
      return node ? JSDOMNode(dom, node as HTMLElement) : null;
    },

    get(id) {
      return JSDOMNode(dom, doc.querySelector(`[data-rid="${id}"]`));
    },

    contains(node) {
      return doc.body.contains(node.node);
    },

    newNode(htmlString) {
      var div = doc.createElement('div');
      div.innerHTML = htmlString.trim();

      // Change this to div.childNodes to support multiple top-level nodes.
      return JSDOMNode(dom, div.firstChild as HTMLElement);
    }
  }
}

export default JSDOMAdapter;
