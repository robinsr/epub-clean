import { result, createEl, validate_task } from './task-utils.js';
import { getTag, getTagSelector } from '../tag.js';


const remove_attrs = (config) => {
  validate_task(config)  
  let { name, selector, args } = config;

  return {
    name,
    selector,
    filter: (node) => true,
    transform: ($, node) => {

      // TODO, data attributes. Not super important
      // 
      // const getAttribute = (n, attr) => {
      //   if (attr.startsWith('data-')) {
      //     return n.dataset[attr.replace('data-','')]
      //   } else {
      //     return n.getAttribute(attr);
      //   }
      // }

      const applyUpdates = (newNode, conf) => {
        let { attribute, op, value } = conf;

        let currentVal = newNode.getAttribute(attribute);

        if (op === 'add') {
          newNode.setAttribute(attribute, value);
        }

        if (op === 'regex') {
          if (!currentVal) {
            console.error(`ERROR: Cannot update attribute ${attribute} on ${getTagSelector(newNode)}`.red)
            return newNode;
          }

          let re = new RegExp(value[0]);
          let replaceVal = currentVal.replace(re, value[1]);
          newNode.setAttribute(attribute, replaceVal);
        }

        if (op === 'replace' && newNode.hasAttribute(attribute)) {
          newNode.setAttribute(attribute, value);
        }

        if (op === 'remove') {
          newNode.removeAttribute(attribute);
        }

        if (newNode.getAttribute(attribute) === '') {
          newNode.removeAttribute(attribute);
        }

        return newNode;
      }
      
      if (getTag(node) !== 'body') {
        let newNode = args.reduce(applyUpdates, node.cloneNode(true));
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