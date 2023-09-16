import { result, validate_task } from './task-utils.js'

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
    filter: (node) => {
      // filtering can be done with css :not selector
      // for the most part. So this function is not
      // really needed

      //node.classList.length == 0 && !node.id;
      return true;
    },
    transform: ($, node) => {
      if (keepContent) {
        return result().html(node.innerHTML).final();
      } else {
        return result().remove(node).final();
      }
    }
  }
}

export default remove_elements;
