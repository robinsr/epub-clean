import { existsSync, readFileSync } from 'fs';
import { ConfigFile, ParsedTask, TaskArgs, TaskDefinition } from './tasks.js';
import { DomAdapter } from '../dom/index.js';
import { diffChars, diffLines, error, info, warn } from '../log.js';
import getTask from './index.js';
import { isEmpty } from 'remeda';


const getConfig = (filename: string): ConfigFile  => {
  if (!existsSync(filename)) {
    throw new Error('Config file not found');
  }

  return JSON.parse(readFileSync(filename, 'utf8'));
}


const parseTaskConfig = (args: TaskArgs): ParsedTask<any> => {
  let task = getTask(args.task).configure(args);
  let errors = task.validate(args);

  if (errors) {
    return { ...task, errors, config: {}, targets: [] };
  }

  let config = task.parse(args);

  return { ...task, config, targets: [] };
}


const queryTargetsForTask = (task: ParsedTask<any>, adapter: DomAdapter) => {
  let { name, selector, filter } = task;

  let nodes = adapter.query(selector);

  info(`Task: [${name}] (${selector}) target count: ${nodes.length}`);

  task.targets = nodes.map(node => ({
    node, include: filter ? filter(node) : true
  }))
      .map(target => {
        global.__opts.targets && info(' - ', target.node.tagSummary[target.include ? 'green' : 'red']);
        return target;
      })
      .filter(target => target.include);

  return task;
}


const taskExcludeFilter = (task: TaskDefinition<any>): boolean => {
  return !task.name.startsWith('X');
}

const taskLogger = (t: ParsedTask<any>) => {
  let { name, selector, targets } = t;
  return { 
    name,
    selector,
    targets: targets.map(t => t.node.tagSummary)
  }
}


const TaskRunner = (adapter, opts) => {
  const config = getConfig(opts.config);
  
  let tasks = config.map(parseTaskConfig)

  let errors = tasks.reduce((acc, task) => {
      if (task.errors) {
        let errs = Object.values(task.errors).map(e => e.message)
        return [...acc, ...errs];
      } else {
        return acc;
      }
  }, []);

  if (!isEmpty(errors)) {
    errors.forEach(e => error(e));
    process.exit(1);
  }

  tasks = tasks.filter(taskExcludeFilter)
    .map(task => queryTargetsForTask(task, adapter))
    .filter(task => task.targets.length > 0);

  global.__opts.targets && info('Resolved tasks:', tasks.map(taskLogger));

  tasks.forEach(task => {
    info(`Starting task: "${task.name}"`);
  
    task.targets.forEach(target => {
      let { node } = target;
      let result = task.transform(task.config, target.node, adapter);

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
        diffLines(node.outer, result.html, `${task.name} #${node.id} INNER-HTML`);
        node.inner = result.html;
      }
    });
  });

  adapter.query('[data-rid]').forEach(n => {
    n.removeAttr('data-rid');
  });

  adapter.query('').forEach(n => {
    n.removeAttr('data-rid');
  });
}

export default TaskRunner;
