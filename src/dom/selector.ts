import logger from '../util/log.js'
import { domAPI } from '../util/dom-utils.js';
import { SelectorComponents } from './dom.js';

import * as spec from 'specificity';
import { isEmpty } from 'remeda';
import {
  AttributeSelector,
  ClassSelector,
  CssNodePlain,
  parse,
  SelectorListPlain,
  SelectorPlain,
  toPlainObject,
  TypeSelector,
} from 'css-tree';


const log = logger.getLogger(import.meta.url);




export const isValidSelector = (selector: string): boolean => {
  try {
    domAPI.window.document.querySelector(removeNamespaces(selector));
  } catch (err) {
    return false;
  }

  return true;
}

/**
 * Accepts a string mapping rule (eg "h5.newCls|all")
 * and returns an object of its properties
 * @deprecated
 */
export const parseSelector = (selector: string): SelectorComponents => {
  let namespaces = getNamespaces(selector);
  let clean = removeNamespaces(selector);

  let preserveAll = namespaces.includes('all');
  let preserveOther = namespaces.includes('other');

  let { tag, classList } = parseSelectorV2(selector);

  return { selector, tag, classList, namespaces, preserveAll, preserveOther }
}

/**
 * Removes namespace part of CSS selector string
 */
export const removeNamespaces = (sel: string): string => {
  return sel.replace(/\|.*$/, '');
}

/**
 * Returns array of namespaces in a CSS selector string
 */
export const getNamespaces = (sel: string): Array<string> => {
  return sel.split('|').slice(1);
}

const echo = (msg: any): any => {
  log.debug('echo:', msg);
  return msg;
}

export const sortSelectors = (selectors: string[]): string[] => {
  return selectors.map(sel => ({
    val: sel,
    score: spec.calculate(removeNamespaces(sel))
  }))
    .sort((a, b) => spec.compare(a.score, b.score))
    .map(i => i.val)
    .reverse()
}

const default_tag = (selector: string = '', tag?: string): SelectorComponents => ({
  selector, tag,
  classList: [],
  namespaces: [],
  preserveAll: false,
  preserveOther: false
});

/**
 * For a given node from CSS-Tree, creates a SelectComponents map,
 * extracting the tag name and css classList
 */
const extractTagAndClassList = (selector: string, node: SelectorPlain) => {
  let tag = null, classList = [], attributes = [];

  if (node.children.at(0).type === 'TypeSelector') {
    tag = (node.children.at(0) as TypeSelector).name;
  }

  classList = node.children
    .filter(n => n.type === 'ClassSelector')
    .map(n => (n as ClassSelector).name);

  attributes = node.children
    .filter(n => n.type === 'AttributeSelector')
  .map(n => (n as AttributeSelector).name);

  return Object.assign({}, default_tag(selector, tag), { classList });
}

type ParseContext = 'selector' | 'selectorList';

/**
 * Parses css selector string using CSS-Tree and
 * returns css selector components
 */
export const parseSelectorV2 = (selector: string): SelectorComponents => {
  log.debug(`Parsing selector string "${selector}" (v2)`);

  if (isEmpty(selector)) {
    return null;
  }

  let isList = selector.match(',');
  let cssTreeContext = isList ? 'selectorList' : 'selector';

  try {
    let tree = toPlainObject(parse(removeNamespaces(selector), { context: cssTreeContext }));
    log.debug(`CSS-Tree: Parsed selector "${removeNamespaces(selector)}":` , tree);

    let type: string, children: CssNodePlain[], p: SelectorComponents;

    if (isList) {
      type = (tree as SelectorListPlain).type;
      children = (tree as SelectorListPlain).children;
      p = extractTagAndClassList(selector, children.at(0) as SelectorPlain)
    }

    if (!isList) {
      type = (tree as SelectorPlain).type;
      children = (tree as SelectorPlain).children;
      p = extractTagAndClassList(selector, tree as SelectorPlain);
    }

    log.debug('CSS-Tree: Found type:', type)
    log.debug('CSS-Tree: Found children:', children);

    return p;

  } catch (e) {
    if (e instanceof Error) log.error(`${e.message} "${selector}"`);
    else log.error(`Invalid selector "${selector}"`);

    return default_tag();
  }
}