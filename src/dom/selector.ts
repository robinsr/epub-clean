import { domlog } from '../log.js'
import { ParsedSelectorString } from './dom.js';
import jsdom from 'jsdom';
import * as spec from 'specificity';
import { isEmpty } from 'remeda';
import {
  ClassSelector,
  CssNodePlain,
  parse,
  SelectorListPlain,
  SelectorPlain,
  toPlainObject,
  TypeSelector,
} from 'css-tree';

const log = domlog.getSubLogger({ name: 'selector' });


const { JSDOM } = jsdom;

const htmlstring = fragment => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  ${fragment}
</body>
</html>`;

const validatorDoc = new JSDOM(htmlstring(''), { includeNodeLocations: true });


export const isValidSelector = (selector: string): boolean => {
  try {
    validatorDoc.window.document.querySelector(removeNamespaces(selector));
  } catch (err) {
    return false;
  }

  return true;
}

/**
 * Accepts a string mapping rule (eg "h5.newCls|all")
 * and returns an object of its properties
 */
export const parseSelector = (selector: string): ParsedSelectorString => {
  let namespaces = getNamespaces(selector);
  let clean = removeNamespaces(selector);

  
  let [ tag, ...classList ] = clean.split('.');

  let preserveAll = namespaces.includes('all');
  let preserveOther = namespaces.includes('other');

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
  log.info(msg);
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

const default_tag = (selector: string = '', tag?: string): ParsedSelectorString => ({
  selector, tag,
  classList: [],
  namespaces: [],
  preserveAll: false,
  preserveOther: false
});

export const parseSelectorV2 = (selector: string): ParsedSelectorString => {
  log.info(selector);

  if (isEmpty(selector)) {
    return null;
  }

  let extractValues = (node: SelectorPlain) => {
    let tag = null, classList = [];

    if (node.children.at(0).type === 'TypeSelector') {
      tag = (node.children.at(0) as TypeSelector).name;
    }

    classList = node.children
      .filter(n => n.type === 'ClassSelector')
      .map(n => (n as ClassSelector).name);

    return Object.assign({}, default_tag(selector, tag), { classList });
  }

  let context = selector.match(',') ? 'selectorList' : 'selector';

  try {
    let tree = toPlainObject(parse(removeNamespaces(selector), { context }));
    log.info(tree);

    let type: string, children: CssNodePlain[], p: ParsedSelectorString;

    if (context === 'selectorList') {
      type = (tree as SelectorListPlain).type;
      children = (tree as SelectorListPlain).children;
      p = extractValues(children.at(0) as SelectorPlain)
    }

    else if (context === 'selector') {
      type = (tree as SelectorPlain).type;
      children = (tree as SelectorPlain).children;
      p = extractValues(tree as SelectorPlain);
      log.info(p)
    }

    log.info('type:', type)
    log.info('children:', children);

    return p;

  } catch (e) {
    if (e instanceof Error) log.error(`${e.message} "${selector}"`);
    else log.error(`Invalid selector "${selector}"`);

    return default_tag();
  }
}