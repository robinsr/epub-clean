import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import getTask from '../tasks.js';
import { debug, diffChars, diffLines, error, info, warn } from '../log.js';



const getConfig = filename => {
  if (!existsSync(filename)) {
    throw new Error('Config file not found');
  }

  return JSON.parse(readFileSync(filename, 'utf8'));
}


const parseTaskConfig = conf => {
  if (!conf || !conf.task || !conf.name) {
    throw new Error('Invalid task:', conf);
  }

  let task = getTask(conf.task);

  if (!task) {
    throw new Error('Invalid task name:', conf.task);
  }

  return task(conf);
}


const taskExcludeFilter = task => {
  return !task.name.startsWith('X');
}


const queryTargetsForTask = (task, adapter) => {
  let { name, selector, transform } = task;

  let nodes = adapter.query(selector);

  info(`Task: [${name}] (${selector}) target count: ${nodes.length}`)

  task.targets = nodes.map(node => ({
    node, include: task.filter(node)
  }))
  .map(target => {
    global.__opts.targsts && info(' - ', target.node.tagSummary[target.include ? 'green' : 'red']);
    return target;
  })
  .filter(target => target.include);

  return task;
}


const TaskRunner = (adapter, opts) => {
  const config = getConfig(opts.config);
  
  const tasks = config.map(parseTaskConfig)
  .filter(taskExcludeFilter)
  .map(task => queryTargetsForTask(task, adapter))
  .filter(task => task.targets.length > 0);

  global.__opts.targets && info('Resolved tasks:', tasks.map(t => {
    let { name, selector, targets } = t;
    return { 
      name,
      selector,
      targets: targets.map(t => t.node.tagSummary)
    }
  }));

  tasks.forEach(task => {
    info(`Starting task: "${task.name}"`);
  
    task.targets.forEach(target => {
      let { node } = target;
      let result = task.transform(target.node, adapter);

      if (result.error) {
        error(result.error);
        throw new Error(result.error)
      }

      if (result.noChange) {
        warn(`No change for task: ${task.name}:${node.location}`);
      }

      if (result.replace) {
        result.replace.forEach(([ oldNode, newNode ]) => {
          oldNode = adapter.get(oldNode.id);
          diffLines(oldNode.outer, newNode.outer, `${task.name} #${node.id} REPLACE-NODE`);
          oldNode.replace(newNode);
        });
      }

      if (result.remove) {
        result.remove.forEach(node => {
          diffChars(node.outer, '', `${task.name} #${node.id} REMOVE-NODE`);
          node.remove();
        });
      }

      if (result.html) {
        diffLines(node.outer, result.html.outer, `${task.name} #${node.id} INNER-HTML`);
        node.inner = result.html.inner;
      }
    });
  });

  adapter.query('[data-rid]').forEach(t => {
    t.removeAttr('data-rid');
  })
}

export default TaskRunner;
