

export type CSSSelectorString = string;
export type CSSClassName = string;
export type CSSNamespace = string;
export type TagName = string;


export interface ParsedSelectorString {
  selector: string;
  tag: TagName;
  classList: Array<CSSClassName>;
  namespaces: Array<CSSNamespace>;
  preserveAll: boolean;
  preserveOther: boolean;
}


/**
 * Accepts a string mapping rule (eg "h5.newCls.*")
 * and returns an object of its properties
 *
 * TODO: Replaces this with CSS selector parse library
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
 * @param  {[type]} sel [description]
 * @return {[type]}     [description]
 */
export const getNamespaces = (sel: string): Array<string> => {
  return sel.split('|').slice(1);
}

