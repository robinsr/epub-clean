/**
 * Creates new DOM elements
 */
export const createEl = ($, htmlString) => {
  var div = $.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

export const createElFromTag = ($, htmlString) => {
  
}