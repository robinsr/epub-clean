import { validate_task } from './task-utils.js'
import result from './task-result.js';
import { 
  parseSelector,
  removeNamespaces
} from '../dom/selector.js';
import { debug } from '../log.js';
import { TransformTaskArgs, TransformTask, TransformTaskResult, TransformFunction } from './transform-task.js';
import { CSSSelectorString, ParsedSelectorString } from '../dom/selector.js';


interface MapElementsInputArgs extends TransformTaskArgs {
  map: {
    [key: CSSSelectorString]: string
  }
}

interface MapElementsConfig extends TransformTaskArgs {
  mapKeys: Array<CSSSelectorString>
  map: {
    [key: CSSSelectorString]: {
      from: ParsedSelectorString, to: ParsedSelectorString
    } 
  }
}

const filter = () => true;

const validate = (args: MapElementsInputArgs): boolean => {
  validate_task(args, ['object']);
  return true;
}

const parse = (args: MapElementsInputArgs): MapElementsConfig => {
  let mapKeys = Object.keys(args.map).map(removeNamespaces);
  let map = mapKeys.reduce((accumulator, key) => ({
      ...accumulator, [key]: {
          from: parseSelector(key),
          to: parseSelector(args.map[key])
        }
      }), {});

  return { ...args, mapKeys, map };
}

const transform: TransformFunction<MapElementsConfig> = (config, node, dom): TransformTaskResult => {
  let { mapKeys, map } = config;

  let matchKey = mapKeys.find(key => node.matches(key));

  debug(`elem matches "${matchKey}"?:`);

  if (!matchKey) {
    return result().error(`No transform key found for element ${node.selector}`);
  }

  let matchProps = map[matchKey].from;
  let newProps = map[matchKey].to;

  debug('Match Props:', matchProps);
  debug('New Props:', newProps);

  let newTag = newProps.tag;
  let matchingCls = matchProps.classList;
  let oldClss = node.classList;
  let newClss = newProps.classList;
  let content = node.inner;

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

  let newNode = dom.newNode(`<${newTag}${classString}>${content}</${newTag}>`);

  return result().replace(node, newNode).final();
}


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
const map_elements = (config: TransformTaskArgs): TransformTask<MapElementsInputArgs, MapElementsConfig> => {
  let { name, selector } = config;

  return { name, selector, filter, validate, parse, transform }
}

export default map_elements;
