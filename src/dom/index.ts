import FileAdapter from './adapter/file-adapter.js';
import JSDOMAdapter from './adapter/jsdom-adapter.js';
import JSDOMNode from './adapter/jsdom-node.js';

export { FileAdapter, JSDOMAdapter, JSDOMNode };

import {
  isValidSelector,
  parseSelector,
  getNamespaces,
  removeNamespaces,
  sortSelectors
} from './selector.js';

export {
  isValidSelector,
  parseSelector,
  getNamespaces,
  removeNamespaces,
  sortSelectors
}

import type {
  SelectorComponents,
  ElementMap,
  ParsedElementMap,
  TagNode,
  Adapter,
  DomAdapter,
  DomNode,
  AccessNode
} from './dom.js';

export {
  SelectorComponents,
  ElementMap,
  ParsedElementMap,
  TagNode,
  Adapter,
  DomAdapter,
  DomNode,
  AccessNode
}
