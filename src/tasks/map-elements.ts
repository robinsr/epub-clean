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
import { parseElementMap, mapNode } from "../dom/element-map.js";
import result from './task-result.js';


const TASK_NAME = 'map-elements';

const argsSchema = {
  map: validators.elementMap()
}

const validate = (args: MapElementsArgs): ValidationResult => {
  return validateSchema(taskSchema.append(argsSchema), args, TASK_NAME);
}

const parse = (args: MapElementsArgs): MapElementsConfig => {
  let map = parseElementMap(args.map);
  let mapKeys = Object.keys(map);

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

  console.log(node.attrs);

  let newNode = dom.newNode(mapNode(node, matchProps, newProps));

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
