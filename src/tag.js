
/**
 * Returns the tag type for a given node
 * or non-null string in the case of a 
 * text node that has no tag type (?)
 *
 * eg <p class="h3 extra"></p> -> "p" 
 */
export const getTag = n => {
  return (n.tagName||'?').toLowerCase();
}

/**
 * Returns the classList for a node as an array
 */
export const getClassList = n => {
  return Array.from(n.classList) || [];
}

/**
 * Returns a string array of the tag expression
 * of a given node, one per class attribute
 *
 * Example:
 * 
 * for a node created from the tag:
 *     <p class="h3 extra"></p>
 *
 * function will return [ 'p.h3', 'p.extra' ]
 */
export const getTagSelectors = n => {
  let tag = getTag(n);
  let clss = getClassList(n);

  if (!clss.length) {
    return [ tag ];
  }

  return clss.map(cls => `${ tag }.${ cls }`);
}

/**
 * Returns a string of the tag expression of
 * a given node with the class attributes combined
 *
 * Example:
 * 
 * for a node created from the tag:
 *     <p class="h3 extra"></p>
 *
 * function will return 'p.h3.extra'
 */
export const getTagSelector = n => {
  let tag = getTag(n);
  let clss = getClassList(n);

  if (!clss.length) {
    return tag;
  }

  return `${ tag }.${ clss.join('.') }`
}

/**
 * Returns a printable "summary" of a tag. Example:
 * 
 * 0024: <p.h3.extra(ELEMENT)>⇒[1], contents: Lorem ipsum...
 */
export const getTagSummary = (n, $) => {
  let tag = `<${getTagSelector(n)}(${NODE_TYPES[n.nodeType]})>`;
  let child = n.childElementCount || 0;
  let content = truncate(n.textContent || 'EMPTY', 80);

  if ($) {
    let loc = $.nodeLocation(n);
    let line = loc ? ("" + loc.startLine).padStart(4, '0') : 'NEW';

    return `${line}: ${tag}⇒[${child}], contents: ${content}`;
  }

  return `${tag}⇒[${child}], contents: ${content}`;
}

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


const truncate = (str, num) => {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  return str.slice(0, num) + '...'
}

const NODE_TYPES = {
  1: 'ELEMENT',
  2: 'ATTRIBUTE',
  3: 'TEXT',
  4: 'CDATA_SECTION',
  7: 'PROCESSING_INSTRUCTION',
  8: 'COMMENT',
  9: 'DOCUMENT',
  10: 'DOCUMENT_TYPE',
  11: 'DOCUMENT_FRAGMENT',
}