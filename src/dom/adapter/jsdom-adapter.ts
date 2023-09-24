import { Adapter, DomAdapter } from './../dom.js';

import format from "html-format";
import jsdom from 'jsdom';
const { JSDOM } = jsdom;


import JSDOMNode from './jsdom-node.js';

const format_indent = ' '.repeat(4);
const format_width = 2000;


const JSDOMAdapter = (adapter: Adapter): DomAdapter => {
  const contents = adapter.getContents();;
  const dom = new JSDOM(contents, { includeNodeLocations: true });
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

    contains(node) {
      return doc.body.contains(node.node);
    },

    get(id) {
      return JSDOMNode(dom, doc.querySelector(`[data-rid="${id}"]`));
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
