import {AccessNode, DomAdapter, JSDOMAdapter} from "../src/dom/index.js";
import {TaskDefinition, TransformTaskResult, TransformTaskType} from "../src/tasks/tasks.js";

import StringAdapter from "./string-adapter.js";


interface SetupResult {
  config: any;
  adapter: DomAdapter;
  nodes: AccessNode[];
  taskDef: TaskDefinition<any>;
  results: TransformTaskResult[]
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

    results.replace.forEach(([ oldNode, newNode ]) => {
      oldNode = adapter.get(oldNode.id);
      oldNode.replace(newNode);
    });

    results.remove.forEach(node => {
      node.remove();
    });

    return results;
  });

  return { results, config, adapter, nodes, taskDef };
}