import { validate_task } from './task-utils.js'
import result from './task-result.js';
import { error } from '../log.js';


const remove_attrs = (config) => {
  validate_task(config);

  let { name, selector, args } = config;

  return {
    name,
    selector,
    filter: (node) => true,
    transform: (node) => {
      const applyUpdates = (node, conf) => {
        let { attribute, op, value } = conf;

        let currentVal = node.getAttr(attribute);

        if (op === 'add') {
          node.setAttr(attribute, value);
        }

        if (op === 'regex') {
          if (!currentVal) {
            error(`Cannot update attribute ${attribute} on ${node.tag}`);
            return node;
          }

          let re = new RegExp(value[0]);
          let replaceVal = currentVal.replace(re, value[1]);
          node.setAttr(attribute, replaceVal);
        }

        if (op === 'replace' && node.hasAttr(attribute)) {
          node.setAttr(attribute, value);
        }

        if (op === 'remove') {
          node.removeAttr(attribute);
        }

        if (node.getAttr(attribute) === '') {
          node.removeAttr(attribute);
        }

        return node;
      }
      
      if (node.tag !== 'body') {
        let newNode = args.reduce(applyUpdates, node.clone());
        return result().replace(node, newNode).final();
      } else {
        args.reduce(applyUpdates, node);
        return result().final();
      }
    }
  }
}

export default remove_attrs;


//let attrs = node.getAttributeNames()
//console.log(attrs);
// Array.from(attrs).forEach(attr => {
//   console.log(attr, node.getAttribute(attr));
// });
//       // TODO, data attributes. Not super important
// 
// const getAttribute = (n, attr) => {
//   if (attr.startsWith('data-')) {
//     return n.dataset[attr.replace('data-','')]
//   } else {
//     return n.getAttribute(attr);
//   }
// }