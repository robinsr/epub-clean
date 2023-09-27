import { AccessNode } from "../dom/index.js";
import { TransformTaskResult, TransformTaskResultsBuilder } from "./tasks.js";
import { isEmpty, pick } from 'remeda';
import { Change, diffLines, diffChars } from 'diff';


abstract class DocumentChange {
  public printDiff() {
    let { label, newLines } = this.formatDiff();
    console.log('[DIFF] '.grey + `(${label}):`.white);
    this.changeDiff().forEach(part => {
      // green for additions, red for deletions grey for common parts
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      process.stderr.write('\t' + part.value[color]);

      newLines && process.stderr.write('\n');
    });
  }

  protected abstract changeDiff(): Change[];
  protected abstract formatDiff(): { label: string, newLines: boolean }
}

class ReplaceAction extends DocumentChange {
  constructor(
    private before: AccessNode,
    private after: AccessNode,
    private taskname: string) {
    super();
  }

  changeDiff() {
    return diffLines(this.before.domString, this.after.domString);
  }

  formatDiff() {
    return {
      label: `${this.taskname} #${this.before.id} REPLACE-NODE`,
      newLines: true
    }
  }
}


class RemoveAction {
  constructor(target: AccessNode) {
  }
}

class ReplaceContentsAction {
  constructor(target: AccessNode) {
  }
}

class TransformTaskResultsBuilder {
  private _remove: RemoveAction[] = [];
  private _replace: ReplaceAction[] = [];
  private _html: ReplaceContentsAction = null;
  private _error = null;
 
  remove(node) {
    this._remove.push(node);
    return this;
  }

  replace(oldNode: AccessNode, newNode: AccessNode): TransformTaskResultsBuilder {
    this._replace.push(new ReplaceAction(oldNode, newNode, 'TODO'));
    return this;
  }

  html(html: ReplaceContentsAction) {
    this._html = html;
    return this;
  }

  error(err) {
    this._error = err;
    return this.final();
  }

  get noChange() {
    return [
      this._remove, this._replace,
      this._html, this._error ].every(isEmpty);
  }

  final(): TransformTaskResult {
    return {
      noChange: this.noChange,
      remove: this._remove,
      replace: this._replace,
      html:  this._html,
      error: this._error
    }
  }
}

const result = () =>  {
  return new TransformTaskResultsBuilder();
}

export const error = (err: string): TransformTaskResult => {
  return new TransformTaskResultsBuilder().error(err);
}

export default result;
