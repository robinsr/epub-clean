import { createEl, result, validate_task } from './task-utils.js'
import { 
  getClassList,
  getTag,
  parseTagExpression,
  removeNamespaces,
  getNamespaces
} from '../tag.js';
import { debug } from '../log.js';


/**
 * Converts elements from one type to another
 *
 * Basic: p.h3 -> h3
 *    <p class="h3 extra"> -> <h3>
 * Add class: p.h3 -> h3.c1.c2
 *    <p class="h3 extra"> -> <h3 class="c1 c2">
 * Preserve all class: p.h3 -> h3.newCls|all
 *    <p class="h3 extra"> -> <h3 class="h3 extra c1 c2">
 * Preserve non-matching classes: p.h3 -> h3.newCls|other
 *    <p class="h3 extra"> -> <h3 class="extra c1 c2">
 */
const map_elements = (config) => {
  validate_task(config, ['object']);

  let { name, selector, args } = config;

  let elementMapKeys = Object.keys(args[0]).map(removeNamespaces);

  /**
   * TODO: Can possible skip this step by using 
   * Element.matches(<selector>). The result would
   */
  let elementMap = elementMapKeys.reduce((acc, key) => {
    return Object.assign(acc, {
      [key]: parseTagExpression(args[0][key])
    });
  }, {});

  return {
    name,
    selector,
    transform: ($, node) => {
      let matchKey = elementMapKeys.find(key => {
        return node.matches(removeNamespaces(key));
      });

      
      debug(`elem matches "${matchKey}"?:`);

      if (!matchKey) {
        return result().final();
      }

      let matchProps = parseTagExpression(removeNamespaces(matchKey));
      let newProps = elementMap[matchKey];

      debug('Match Props:', matchProps);
      debug('New Props:', newProps);

      //let { newTag, newClss, preserveAll, preserveOther } = elementMap[match];
      let newTag = newProps.tag;
      let matchingCls = matchProps.classList;
      let oldClss = getClassList(node);
      let newClss = newProps.classList;

      // preserve all
      if (newProps.preserveAll) {
        newClss = [ ...oldClss, ...newClss ];
      }

      // preserve other
      if (newProps.preserveOther) {
        oldClss = oldClss.filter(cls => !matchingCls.includes(cls));
        newClss = [ ...oldClss, ...newClss ];
      }

      let classString = newClss.length ? ` class="${newClss.join(' ')}"` : "";

      let newNode = createEl($, 
        `<${newTag}${classString}>${node.innerHTML}</${newTag}>`);


      return result().replace(node, newNode).final();
    }
  }
}

export default map_elements;
