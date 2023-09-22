import { RemoveElementsArgs, TransformTaskType } from './tasks.js';
import { taskSchema,validateSchema, validators } from './task-config.js';
import result from './task-result.js';

const TASK_NAME = 'remove-elements';

const schema = {
  'keep-content': validators.bool().any()
}

const validate = (args) => {
  return validateSchema(taskSchema.append(schema), args, TASK_NAME);
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
  type: TASK_NAME,
  configure: (config) => {
    let { name, selector } = config;
    return { name, selector, validate, parse, transform }
  }
}

export default RemoveElements;
