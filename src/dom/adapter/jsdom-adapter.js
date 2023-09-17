import jsdom from 'jsdom';
const { JSDOM } = jsdom;


import FileAdapter from './file-adapter.js';
import JSDOMNode from './jsdom-node.js';



const JSDOMAdapter = adapter => {
  const contents = adapter.getContents();;
  const dom = new JSDOM(contents, { includeNodeLocations: true });
  const doc = dom.window.document;

  return {
    get contents() {
      return contents;
    },

    get body() {
      return dom.window.document.body.outerHTML;
    },

    query(selector) {
      let nodes = doc.querySelectorAll('body ' + selector);

      return Array.from(nodes).map(node => {
        return JSDOMNode(dom, node);
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
      return JSDOMNode(dom, div.firstChild);
    }
  }
}

export default JSDOMAdapter;
