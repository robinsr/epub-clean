/**
 * Creates new DOM elements
 */
export const createEl = ($, htmlString) => {
  throw new Error('Do not use');
  var div = $.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

export const createElFromTag = ($, htmlString) => {
  
}