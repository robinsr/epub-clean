import { Adapter, DomAdapter } from './../dom.js';

import format from "html-format";
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import JSDOMNode from './jsdom-node.js';

const format_indent = ' '.repeat(4);
const format_width = 2000;


class JSDOMAdapterImpl implements DomAdapter {
  private dom: jsdom.JSDOM;
  private doc: Document;

  constructor(private adapter: Adapter) {
    const contents = adapter.getContents();
    this.dom = new JSDOM(contents, {
      url: 'https://example.org/',
      referrer: 'https://example.com/',
      contentType: 'text/html',
      includeNodeLocations: true,
      storageQuota: 10000000
    });
    this.doc = this.dom.window.document;
  }

  get body() {
    return format(this.dom.window.document.body.outerHTML, format_indent, format_width);
  }

  query(selector) {
    let nodes = this.doc.querySelectorAll('body ' + selector);

    return Array.from(nodes).map(node => {
      return JSDOMNode(this.dom, node as HTMLElement);
    });
  }

  first(selector) {
    let node = this.doc.querySelector('body ' + selector);
    return node ? JSDOMNode(this.dom, node as HTMLElement) : null;
  }

  get(id) {
    let node = this.doc.querySelector(`[data-rid="${id}"]`);
    return node ? JSDOMNode(this.dom, node as HTMLElement) : null;
  }

  contains(node) {
    return this.doc.body.contains(node.node);
  }

  newNode(htmlString) {
    let div = this.doc.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes.
    return JSDOMNode(this.dom, div.firstChild as HTMLElement);
  }

  clean(): void {
    // this.query('[data-rid]').forEach(n => {
    //   n.removeAttr('data-rid');
    // });

    this.query('*').forEach(n => {
      n.removeAttr('data-rid');
    });
  }
}

const JSDOMAdapter = (adapter: Adapter) => {
  return new JSDOMAdapterImpl(adapter);
}

export default JSDOMAdapter;
