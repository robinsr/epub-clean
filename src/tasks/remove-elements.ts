import { RemoveElementsArgs, TransformTaskType } from './tasks.js';
import { taskSchema,validateSchema, validators } from './task-config.js';
import result from './task-result.js';


const schema = {
  content: validators.bool().any
}

const validate = (args) => {
  return validateSchema({ ...taskSchema, ...schema }, args)
}

const parse = (args) => args;

const transform = (config, node) => {
  if (config.content) {
    return result().html(node.inner).final();
  } else {
    return result().remove(node).final();
  }
}


const RemoveElements: TransformTaskType<RemoveElementsArgs> = {
  type: 'remove-elements',
  configure: (config) => {
    let { name, selector } = config;
    return { name, selector, validate, parse, transform }
  }
}

export default RemoveElements;
