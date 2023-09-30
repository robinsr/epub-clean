import { existsSync, readFileSync } from 'node:fs';
import { extname } from 'node:path';
import * as process from 'node:process';
import { isEmpty, equals } from 'remeda';
import JSON5 from 'json5'
import yaml from 'js-yaml';

import logger from '../log.js';
import { ConfigFile, ParsedTask, TaskArgs, TaskDefinition } from './tasks.js';
import { Adapter, DomAdapter } from '../dom/index.js';
import getTask from './index.js';
import { taskSchema, validateSchema, validators } from './task-config.js';

const log = logger.getLogger(import.meta.url);
log.addContext('task', 'task-runner');

const configSchema = validators.array().items(taskSchema.unknown(true));

type config_type = 'json' | 'json5' | 'yaml' | 'unsupported';

const getFileType = (filename: string): config_type => {
  let ext = extname(filename);

  let ext_map = {
    '.json': 'json',
    '.json5': 'json5',
    '.yaml': 'yaml',
    '.yml': 'yaml',
  };

  if (ext_map[ext]) {
    return ext_map[ext];
  } else {
    throw new Error(`Unsupported config filetype: ${ext}`);
  }
}


const getConfig = (filename: string): ConfigFile  => {
  if (!existsSync(filename)) {
    throw new Error('Config file not found');
  }

  let filetype = getFileType(filename);
  log.debug(`Reading config file ${filetype}`)

  let parse_map = {
    'json': (c) => JSON.parse(c),
    'json5': (c) => JSON5.parse(c),
    'yaml': (c) => yaml.load(c),
  };

  let config = parse_map[filetype](readFileSync(filename, 'utf8'));

  let configErrors = validateSchema(configSchema, config);

  if (configErrors) {
    Object.values(configErrors)
      .map(e => e.message)
      .forEach(e => log.error(e));

    process.exit(1);
  }

  return config;
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

  log.info(`Task: [${name}] (${selector}) target count: ${nodes.length}`);

  task.targets = nodes.map(node => ({
    node, include: filter ? filter(node) : true
  }))
      .map(target => {
        global.__opts.targets && log.info(' - ', target.node.tagSummary[target.include ? 'green' : 'red']);
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


const TaskRunner = (adapter: DomAdapter, opts: CleanCmdOpts) => {
  const config = getConfig(opts.config.toString());
  let tasks = config.map(parseTaskConfig);

  let errors = tasks.reduce((acc, task) => {
      if (task.errors) {
        let errs = Object.values(task.errors).map(e => e.message)
        return [...acc, ...errs];
      } else {
        return acc;
      }
  }, []);

  if (!isEmpty(errors)) {
    errors.forEach(e => log.error(e));
    process.exit(1);
  }

  tasks = tasks.filter(taskExcludeFilter)
    .map(task => queryTargetsForTask(task, adapter))
    .filter(task => task.targets.length > 0);

  if (opts.targets) {
    log.info('Resolved tasks:', tasks.map(taskLogger));
    process.exit(1);
  }

  tasks.forEach(task => {
    log.info(`Starting task: "${task.name}"`);
  
    task.targets.forEach(target => {
      let { node } = target;
      let result = task.transform(task.config, target.node, adapter);

      if (result.error) {
        log.error(result.error);
        throw new Error(result.error)
      }

      if (result.noChange) {
        log.warn(`No change for task: "${task.name}" (line: ${node.location.startLine})`);
      }

      const applyChange = action => {
        action.printDiff();
        action.applyChange(adapter);
      }

      result.modify.forEach(applyChange);
      result.replace.forEach(applyChange);
      result.remove.forEach(applyChange);
    });
  });

  adapter.clean();

  return this;
}

export default TaskRunner;
