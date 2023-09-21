import FileAdapter from './adapter/file-adapter.js';
import JSDOMAdapter from './adapter/jsdom-adapter.js';
import JSDOMNode from './adapter/jsdom-node.js';

export { FileAdapter, JSDOMAdapter, JSDOMNode };

import {
  isValidSelector,
  parseSelector,
  getNamespaces,
  removeNamespaces
} from './selector.js';

export {
  isValidSelector,
  parseSelector,
  getNamespaces,
  removeNamespaces
}

import type {
  CSSSelectorString,
  CSSClassName,
  CSSNamespace,
  TagName,
  ParsedSelectorString,
  TagNode,
  Adapter,
  DomAdapter,
  DomNode,
  AccessNode
} from './dom.js';

export {
  CSSSelectorString,
  CSSClassName,
  CSSNamespace,
  TagName,
  ParsedSelectorString,
  TagNode,
  Adapter,
  DomAdapter,
  DomNode,
  AccessNode
}
