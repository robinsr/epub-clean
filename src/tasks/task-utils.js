import TaskResult from './task-result.js';

/**
 * Creates new DOM elements
 */
export const createEl = ($, htmlString) => {
  var div = $.createElement('div');
  div.innerHTML = htmlString.trim();

  // Change this to div.childNodes to support multiple top-level nodes.
  return div.firstChild;
}

/**
 * Traverses a DOM tree, appling a callback
 * function to each end node 
 *
 * Useful for transforming text in elements
 * with formatting elements (<b>, <i>, etc)
 */
export const walkTree = (node, func) => {
  //log(logEl(node));
  if (node.hasChildNodes()) {
    Array.from(node.childNodes).forEach(n => walkTree(n, func));
  } else {
    func(node);
  }
}

const empty_result = { remove: [], replace: [], html: null };

export const result = (opts = {}) => {
  //return Object.assign({}, empty_result, opts);
  return new TaskResult();
}

export const validate_task = (config, args) => {
  if (!config) {
    throw new Error('Missing config');
  }

  if (!Object.hasOwn(config, 'name') || !Object.hasOwn(config, 'selector')) {
    throw new Error('Invalid config: name/select')
  }

  if (args) {
    if (!Object.hasOwn(config, 'args') || !Array.isArray(config.args)) {
      throw new Error('Invalid config: args');
    }

    for (var i = 0; i < args.length; i++) {
      if (!config.args[i] || typeof config.args[i] !== args[i]) {
        throw new Error(`Invalid config: args[${i}] (${args[i]})`);
      }
    }

    // doesn't matter, will throw if invalid
    return true;
  }
}
