import {
  AccessNode,
  DomAdapter,
  JSDOMAdapter
} from "../../src/dom/index.js";
import {
  TaskDefinition,
  TransformTaskType
} from "../../src/tasks/tasks.js";

import StringAdapter from "./string-adapter.js";
import TaskResult from '../../src/tasks/task-result.js';


interface SetupResult {
  config: any;
  adapter: DomAdapter;
  nodes: AccessNode[];
  taskDef: TaskDefinition<any>;
  results: TaskResult[]
}

export const setupTest = (
  task: TransformTaskType<any>,
  args,
  fragment): SetupResult => {
  let adapter = JSDOMAdapter(StringAdapter(fragment));
  let taskDef = task.configure(args);
  let { selector, parse, transform } = taskDef;
  let config = parse(args);
  let nodes = adapter.query(selector);

  let results = nodes.map(n => {
    let results = taskDef.transform(config, n, adapter);

    results.docChanges.forEach(change => {
      change.applyChange(adapter);
    });

    return results;
  });

  return { results, config, adapter, nodes, taskDef };
}