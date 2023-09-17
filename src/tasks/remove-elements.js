import { validate_task } from './task-utils.js'
import result from './task-result.js';

const KEEP = 'keep-content';

/**
 * Removes spans that do nothing
 * @type {TaskResult}
 */
const remove_elements = (config) => {
  let { name, selector, args } = config;

  validate_task(config, [ 'string' ]);

  let keepContent = args[0] === KEEP;

  return {
    name,
    selector,
    filter: (node) => true,
    transform: (node) => {
      if (keepContent) {
        return result().html(node.inner).final();
      } else {
        return result().remove(node).final();
      }
    }
  }
}

export default remove_elements;
