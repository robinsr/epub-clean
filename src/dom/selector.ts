import { ParsedSelectorString } from './dom.js';

import jsdom from 'jsdom';
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
  
  let [ tag, ...classList ] = removeNamespaces(selector).split('.');

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

