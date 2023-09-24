import ShortUniqueId from 'short-unique-id';

import Tag from '../tag.js';
import { debug, error } from '../../log.js';
import { NODE_TYPES } from './node.js';
import { AccessNode, DomNode } from '../dom.js';

import jsdom from 'jsdom';
import {Optional} from "typescript-optional";




const short = new ShortUniqueId.default({ length: 8 })
const uuid = () => {
  return short.rnd();
}

const isElement = (node) => {
  return NODE_TYPES[node.nodeType] === 'ELEMENT';
}

const default_pos = {
  startLine: null,
  startCol: 0
}

const JSDOMNode = (dom: jsdom.JSDOM, node: HTMLElement): AccessNode  => {
  let _node = node;
  let doc = dom.window.document;
  
  if (!_node) {
    //throw new Error('no DOM node supplied')
    error('No DOM node supplied');
    //return doc;
  }

  let location = isElement(node) ? dom.nodeLocation(node) : default_pos;
  let lineNo = location ? ("" + location.startLine).padStart(4, '0') : 'NEW';

  if (_node.dataset && !_node.dataset.rid) {
    _node.dataset.rid = uuid();
  }

  let accessors: DomNode = {
    get node() {
      return _node;
    },

    get id() {
      return _node.dataset ? _node.dataset.rid : '?'
    },

    setId(str) {
      // this should set the actual id
      _node.dataset.rid = str;
    },

    get location() {
      return location;
    },

    get isValid() {
      return doc.contains(_node);
    },

    remove() {
      _node.parentNode.removeChild(_node);
    },

    replace(other) {
      debug(`Replacing node:\n\t${this.tagSummary['red']}\n\t${other.tagSummary['green']}`)

      if (_node.isSameNode(other.node)) {
        error('Replacing is same node!');
        return;
      }

      if (!doc.contains(_node)) {
        error('Node is not in the doc!', this.tagSummary);
        return;
      }

      if (!_node.parentNode) {
        error(`no parent node for node ${this.tagSummary}`)
        doc.body.replaceChild(other.node, _node);
      } else {
        _node.parentNode.replaceChild(other.node, _node);
      }

      _node = other.node;
    },

    clone() {
      return JSDOMNode(dom, _node.cloneNode(true) as HTMLElement);
    },

    get outer() {
      return _node.outerHTML;
    },

    set outer(htmlStr) {
      _node.outerHTML = htmlStr;
    },

    get inner() {
      return _node.innerHTML;
    },

    set inner(htmlStr) {
      _node.innerHTML = htmlStr;
    },

    get text() {
      return _node.textContent;
    },

    set text(textStr) {
      _node.textContent = textStr;
    },

    get tag() {
      if (_node.tagName) {
        return _node.tagName.toLowerCase();
      } else if (_node.outerHTML) {
        return /<(\w+)/.exec(_node.outerHTML)[1];
      } else {
        return '?';
      }
    },

    get type() {
      return NODE_TYPES[_node.nodeType];
    },

    get isElement() {
      return NODE_TYPES[_node.nodeType] === 'ELEMENT';
    },

    get isText() {
      return NODE_TYPES[_node.nodeType] === 'TEXT';
    },

    get attrs() {
      return Array.from(_node.attributes).reduce((acc, attr) => ({
         ...acc, [attr.name]: attr.value
      }), {});
    },

    hasAttr(attribute) {
      return _node.hasAttribute(attribute);
    },

    getAttr(attribute) {
      return _node.getAttribute(attribute);
    },

    setAttr(attribute, value) {
      _node.setAttribute(attribute, value);
    },
    
    removeAttr(attribute) {
      _node.removeAttribute(attribute);
    },
    
    get classList() {
      return this.isElement ? [..._node.classList] : [];
    },

    hasClass(className) {
      return [..._node.classList].includes(className);
    },

    addClass(className) {
      _node.classList.add(className);
    },

    /** @unused */
    removeClass(cls) {
      _node.classList.remove(cls);
    },

    matches(selector) {
      return _node.matches(selector);
    },

    get children() {
      return Array.from(_node.childNodes).map(child => JSDOMNode(dom, child as HTMLElement));
    },

    get hasChildren() {
      return _node.hasChildNodes();
    },
    
    get childCount() {
      return _node.childElementCount;
    },

    contains(node) {
      return _node.contains(node.node);
    },

    isSameNode(node) {
      return _node.isSameNode(node.node);
    },

    get parent() {
      return JSDOMNode(dom, _node.parentNode as HTMLElement);
    },

    find(selector: string): AccessNode[] {
      return Array.from(_node.querySelectorAll(selector)).map(n => {
        return JSDOMNode(dom, n as HTMLElement)
      })
    },

    next(): Optional<AccessNode> {
      let sibling = _node.nextElementSibling;

      if (sibling) {
        return Optional.of(JSDOMNode(dom, sibling as HTMLElement));
      } else {
        return Optional.empty();
      }
    }
  }

  return Object.assign(accessors, Tag(accessors, lineNo));
}


export default JSDOMNode;
