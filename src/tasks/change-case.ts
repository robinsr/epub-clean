import { DomNode } from '../dom/index.js';
import { walkTree } from './task-utils.js';
import result from './task-result.js';
import { validators, taskSchema, validateSchema } from './task-config.js';
import { 
  ChangeCaseArgs,
  TransformFunction,
  TransformTaskResult,
  TransformTaskType,
  VoidDomFunction
} from "./tasks.js";


const toTitleCase = (n: DomNode) => {
  n.text = n.text.toLowerCase().replace(/\b\w/g, s => s.toUpperCase());
}

const toUpperCase = (n: DomNode) => {
  n.text = n.text.toUpperCase();
}

const toLowerCase = (n: DomNode) => {
  n.text = n.text.toLowerCase();
}

const transformMap: Record<string, VoidDomFunction> = {
  'lower-case': toLowerCase,
  'title-case': toTitleCase,
  'upper-case': toUpperCase,
}

const changeCaseSchema = {
  case: validators.string().enum(...Object.keys(transformMap))
}

const validate = (args: ChangeCaseArgs): boolean => {
  return validateSchema({ ...taskSchema, ...changeCaseSchema  }, args);
}

const parse = (args: ChangeCaseArgs): VoidDomFunction => {
  return transformMap[args.case];
};

const transform: TransformFunction<VoidDomFunction> = (textFunc, node): TransformTaskResult => {

  if (!node.text) {
    return result().error('Node contains no text');
  }

  let newNode = node.clone();

  if (node.hasChildren) {
    walkTree(newNode, textFunc);
  } else {
    textFunc(newNode);
  }

  if (node.text === newNode.text) {
    return result().error('No text changed');
  }

  return result().html(newNode.inner).final();
}

const ChangeCase: TransformTaskType<ChangeCaseArgs, VoidDomFunction> = {
  type: 'change-case',
  configure: (config) => {
    let { name, selector } = config;
    return { name, selector, validate, parse, transform };
  }
}

export default ChangeCase;