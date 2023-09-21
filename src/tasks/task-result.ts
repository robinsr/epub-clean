import { AccessNode } from "../dom/index.js";
import { TransformTaskResult, TransformTaskResultsBuilder } from "./tasks.js";

const TaskResult = (): TransformTaskResultsBuilder => {
  let _remove = [];
  let _replace = [];
  let _html = null;
  let _error = null;
 
  return {
    remove(node) {
      _remove.push(node);
      return this;
    },

    replace(oldNode: AccessNode, newNode: AccessNode): TransformTaskResultsBuilder {
      _replace.push([oldNode, newNode]);
      return this;
    },

    html(html) {
      _html = html;
      return this;
    },

    error(err) {
      _error = err;
      return this.final();
    },

    final() {
      return {
        noChange: empty(_remove) && empty(_replace) && empty(_html) && empty(_error),
        remove: _remove,
        replace: _replace,
        html: _html,
        error: _error
      }
    }
  }
}

const empty = (arr: string | Array<any>): boolean => {
  if (arr === null) return true;
  if (typeof arr === 'string' && arr === '') return true
  if (Array.isArray(arr) && arr.length === 0) return true;
  return false;
}

const result = (): TransformTaskResultsBuilder =>  {
  return TaskResult();
}

export const error = (err: string): TransformTaskResult => {
  return TaskResult().error(err);
}


export default result;
