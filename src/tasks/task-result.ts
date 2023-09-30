import { AccessNode } from '../dom/index.js';
import { isEmpty } from 'remeda';
import ReplaceAction from '../diff/ReplaceAction.js';
import RemoveAction from '../diff/RemoveAction.js';
import ModifyAction from '../diff/ModifyAction.js';
import DocumentChange from '../diff/DocChange.js';

export default class TaskResult {
  //remove: RemoveAction[] = [];
  //replace: ReplaceAction[] = [];
  //modify: ModifyAction[] = [];
  docChanges: DocumentChange[] = [];
  error = null;

  get noChange() {
    let fields = [ this.docChanges, this.error ];
    let allEmpty = fields.every(isEmpty);

    if (allEmpty) return true;

    return this.docChanges.flat()
      .every(change => change.noChangePresent)
  }

  public get remove(): DocumentChange[] {
    return this.docChanges.filter(dc => dc.type === 'REMOVE-NODE');
  }

  public get replace(): DocumentChange[] {
    return this.docChanges.filter(dc => dc.type === 'REPLACE-NODE');
  }

  public get modify(): DocumentChange[] {
    return this.docChanges.filter(dc => dc.type === 'MODIFY-NODE');
  }

  static Builder = class {
    private readonly taskName: string;
    private result = new TaskResult();

    constructor(taskName: string) {
      this.taskName = taskName;
    }

    remove(node: AccessNode) {
      this.result.docChanges.push(new RemoveAction(node, this.taskName));
      return this;
    }

    replace(oldNode: AccessNode, newNode: AccessNode): this {
      this.result.docChanges.push(new ReplaceAction(oldNode, newNode, this.taskName));
      return this;
    }

    modify(target: AccessNode, takeFrom: AccessNode) {
      this.result.docChanges.push(new ModifyAction(target, takeFrom, this.taskName));
      return this;
    }

    error(err: string) {
      this.result.error = err;
      return this.final();
    }

    final(): TaskResult {
      return this.result;
    }
  }
}

export const newResult = (taskName = 'Unknown') =>  {
  return new TaskResult.Builder(taskName);
}

export const error = (err: string, taskName = 'Unknown'): TaskResult => {
  return new TaskResult.Builder(taskName).error(err);
}

