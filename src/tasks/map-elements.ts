import { debug } from '../log.js';
import {
  TransformTaskResult,
  TransformFunction,
  TransformTaskType,
  MapElementsArgs,
  MapElementsConfig
} from './tasks.js';
import {
  validateSchema,
  //validators,
  taskSchema
} from './task-config.js'
import result from './task-result.js';
import {
  parseSelector,
  removeNamespaces
} from '../dom/index.js';

const argsSchema = {
  // map: {
  //   type: Object,
  //   required: true
  // }
}

const mapSchema = {
  // mapKeys: {
  //   type: Array,
  //   each: {
  //     use: validators.string().selector
  //   }
  // },
  // mapValues: {
  //   type: Array,
  //   each: {
  //     use: validators.selector
  //   }
  // }
}

const validate = (args: MapElementsArgs): boolean => {
  validateSchema({ ...taskSchema, ...argsSchema }, args);
  validateSchema(mapSchema, { 
    mapKeys: Object.keys(args.map),
    mapValues: Object.values(args.map)
  });

  return true;
}

const parse = (args: MapElementsArgs): MapElementsConfig => {
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


const MapElements: TransformTaskType<MapElementsArgs, MapElementsConfig> = {
  type: 'map-elements',
  configure: (config) => {
    let { name, selector } = config;
    return { name, selector, parse, transform, validate }
  }
}

export default MapElements;
