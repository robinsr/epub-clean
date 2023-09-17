import { validate_task } from './task-utils.js'
import result from './task-result.js';


const group_elements = config => {
  let { name, selector, args } = config;

  validate_task(config, [ 'object' ]);

  let keepContent = args[0] === 'poop';

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

export default group_elements;