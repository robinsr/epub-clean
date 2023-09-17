

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
