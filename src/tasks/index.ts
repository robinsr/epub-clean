import { tasklog as log } from '../log.js';
import { TransformTaskType } from './tasks.js';
import AmendAttrsTask  from './amend-attrs.js';
import GroupElementsTask from './group-elements.js';
import ChangeCaseTask from './change-case.js';
import RemoveElementsTask from './remove-elements.js';
import MapElementsTask from './map-elements.js';


log.addContext('task', 'task-index');

const _tasks = [
  AmendAttrsTask,
  GroupElementsTask,
  ChangeCaseTask,
  RemoveElementsTask,
  MapElementsTask
];

const tasks = _tasks.reduce((map, task) => {
  return map.set(task.type, task);
}, new Map<string, TransformTaskType<any>>());

log.info('Available tasks:', tasks);

const getTask = (taskName: string): TransformTaskType<any> => {
  if (!tasks.has(taskName)) {
    throw new Error(`Invalid task: ${taskName}`);
  }

  return tasks.get(taskName);
}

export default getTask;
