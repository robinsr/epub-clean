import result from './task-result.js';
import {CommonTaskArgs, GroupElementsArgs, TransformTaskType} from './tasks.js';
import {validators, taskSchema, validateSchema} from "./task-config.js";

const task_name = 'group-elements';

const argsSchema = {
  wrapper: validators.selector(),
  map: validators.elementMap()
}

const validate = (args: GroupElementsArgs) => {
  return validateSchema(taskSchema.append(argsSchema), args, task_name);
}



const GroupElements: TransformTaskType<GroupElementsArgs> = {
  type: 'group-elements',
  configure: (args: CommonTaskArgs) => ({
    name: args.name,
    selector: args.selector,
    validate,
    parse: (args) => args,
    transform: (config, node, dom) => {
      return result().final()
    }
  })
}

export default GroupElements;