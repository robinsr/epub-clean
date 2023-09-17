import { walkTree, validate_task } from './task-utils.js';
import result from './task-result.js';

const toTitleCase = n => {
  n.text = n.text.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

const toUpperCase = n => {
  // TODO
  return text;
}

const toLowerCase = n => {
  // TODO
  return text;
}

const transform_map = {
  ['title-case']: toTitleCase,
  ['lower-case']: toLowerCase,
  ['upper-case']: toUpperCase,
}

/**
 * Modifies text content (eg converting UPPER_CASE to TitleCase)
 * without removing formatting elements (<b>, <i>, etc)
 */
const change_case = (config) => {
  validate_task(config, ['string']);

  let { name, selector, args } = config;

  if (!Object.keys(transform_map).includes(args[0])) {
    throw new Error(`Invalid case argument: ${args[0]}`);
  }

  let textFunc = transform_map[args[0]];

  return {
    name,
    selector,
    filter: (node) => true,
    transform: (node) => {

      if (!node.text) {
        return result().error('Node contains no text').final();
      }

      let newNode = node.clone();

      if (node.hasChildren) {
        walkTree(newNode, textFunc);
      } else {
        textFunc(newNode);
      }

      if (node.text === newNode.text) {
        return result().error('No text changed').final();
      }

      return result().html(newNode).final();
      //return result().replace(node, newNode).final();
    }
  }
}

export default change_case;
