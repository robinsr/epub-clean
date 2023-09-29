import { RemoveElementsArgs, TransformTaskType } from './tasks.js';
import { taskSchema,validateSchema, validators } from './task-config.js';
import { newResult } from './task-result.js';

const TASK_NAME = 'remove-elements';

const schema = {
  'keep-content': validators.bool().any()
}

const validate = (args: RemoveElementsArgs) => {
  return validateSchema(taskSchema.append(schema), args, TASK_NAME);
}

const parse = (args: RemoveElementsArgs): RemoveElementsArgs => args;

const transform = (config, node) => {
  let r = newResult(`${config.name} (${TASK_NAME})`);
  if (config.content) {
    return r.modify(node, node.inner).final();
  } else {
    return r.remove(node).final();
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
