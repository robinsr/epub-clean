import { TransformTaskType } from './tasks.js';

import amend_attrs  from './amend-attrs.js';
import change_case from './change-case.js';
import remove_elements from './remove-elements.js';
import map_elements from './map-elements.js';
import result from './task-result.js';
import { info } from '../log.js';
//import group_elements from './group-elements.js';

const group_elements: TransformTaskType<null> = {
  type: 'group-elements',
  configure: () => ({
    name: 'a',
    selector: 'b',
    validate: () => true,
    parse: (args) => args,
    transform: () => result().final()
  })
}

const _tasks = [ 
  amend_attrs,
  change_case,
  group_elements,
  remove_elements,
  map_elements
];

const tasks = _tasks.reduce((map, task) => {
  return map.set(task.type, task);
}, new Map<string, TransformTaskType<any>>());

info('Available tasks:', tasks);


const getTask = (taskName: string): TransformTaskType<any> => {
  if (!tasks.has(taskName)) {
    throw new Error(`Invalid task: ${taskName}`);
  }

  return tasks.get(taskName);
}

export default getTask;
