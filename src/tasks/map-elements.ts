import { debug } from '../log.js';
import {
  TransformTaskResult,
  TransformFunction,
  TransformTaskType,
  MapElementsArgs,
  MapElementsConfig,
  ValidationResult
} from './tasks.js';
import {
  validateSchema,
  validators,
  taskSchema
} from './task-config.js'
import result from './task-result.js';
import {
  parseSelector,
  removeNamespaces
} from '../dom/index.js';

const TASK_NAME = 'map-elements';

let { array, object, selector } = validators;

const argsSchema = {
  map: object().unknown()
}

const mapSchema = object({
  mapKeys: array().items(selector()),
  mapValues: array().items(selector())
});

const validate = (args: MapElementsArgs): ValidationResult => {
  let errors = validateSchema(taskSchema.append(argsSchema), args, TASK_NAME);

  let selectorErrors = validateSchema(mapSchema, {
    mapKeys: Object.keys(args.map),
    mapValues: Object.values(args.map)
  }, TASK_NAME);

  return Object.assign({}, errors, selectorErrors);
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
  type: TASK_NAME,
  configure: (config) => {
    let { name, selector } = config;
    return { name, selector, parse, transform, validate }
  }
}

export default MapElements;
