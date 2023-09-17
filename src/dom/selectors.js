/**
 * Removes namespace part of CSS selector string
 */
export const removeNamespaces = sel => {
  return sel.replace(/\|.*$/, '');
}

/**
 * Returns array of namespaces in a CSS selector string
 * @param  {[type]} sel [description]
 * @return {[type]}     [description]
 */
export const getNamespaces = sel => {
  return sel.split('|').slice(1);
}

/**
 * Accepts a string mapping rule (eg "h5.newCls.*")
 * and returns an object of its properties
 *
 * TODO: Replaces this with CSS selector parse library
 */
export const parseTagExpression = rule => {
  let namespaces = getNamespaces(rule);
  
  let [ tag, ...classList ] = removeNamespaces(rule).split('.');

  let preserveAll = namespaces.includes('all');
  let preserveOther = namespaces.includes('other');

  return { tag, classList, namespaces, preserveAll, preserveOther }
}

