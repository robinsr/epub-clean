import { result, walkTree, validate_task } from './task-utils.js';

const toTitleCase = n => {
  n.textContent = n.textContent.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
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

  return {
    name,
    selector,
    transform: ($, node) => {
      let str = node.textContent;

      if (!str) {
        return empty_result; 
      }

      if (!Object.keys(transform_map).includes(args[0])) {
        return result().error().final();
      }

      let new_el = node.cloneNode(true);

      if (node.hasChildNodes()) {
        walkTree(new_el, transform_map[args[0]]);
      } else {
        transform_map[args[0]](new_el);
      }

      if (node.textContent === new_el.textContent) {
        return result().close();
      }

      return result().replace(node, new_el).final();
    }
  }
}

export default change_case;
