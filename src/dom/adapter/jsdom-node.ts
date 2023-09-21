import ShortUniqueId from 'short-unique-id';

import Tag from '../tag.js';
import { debug, error } from '../../log.js';
import { NODE_TYPES } from './node.js';
import { AccessNode, DomNode } from '../dom.js';

import jsdom from 'jsdom';




const short = new ShortUniqueId.default({ length: 8 })
const uuid = () => {
  return short.rnd();
}

const isElement = (node) => {
  return NODE_TYPES[node.nodeType] === 'ELEMENT';
}


const JSDOMNode = (dom: jsdom.JSDOM, node: HTMLElement): AccessNode  => {
  let _node = node;
  let doc = dom.window.document;
  
  if (!_node) {
    //throw new Error('no DOM node supplied')
    error('No DOM node supplied');
    //return doc;
  }

  let location = (n => {
    let loc = isElement(n) ? dom.nodeLocation(n) : null;
    return loc ? ("" + loc.startLine).padStart(4, '0') : 'NEW';
  })(_node);

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
      return (_node.tagName||'?').toLowerCase();
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
    }
  }

  return Object.assign(accessors, Tag(accessors, location));
}


export default JSDOMNode;
