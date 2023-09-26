import { AccessNode } from "../dom/index.js";
import { TransformTaskResult, TransformTaskResultsBuilder } from "./tasks.js";
import { isEmpty, pick } from 'remeda';
import { Change, diffLines, diffChars } from 'diff';

const scrubId = (str: string) => {
  return str.replaceAll(/\s?data-rid="[\d\w]+"\s?/g, '');
}

const diffHeader = (name: string) => {
  console.log('[DIFF] '.grey + `(${name}):`.white);
}

abstract class DocumentChange {
  #line_break = false
  protected constructor(line_break = false) {
    this.#line_break = line_break;
  }

  print() {
    this.diff.forEach(part => {
      // green for additions, red for deletions grey for common parts
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      process.stderr.write('\t' + part.value[color]);

      this.#line_break && process.stderr.write('\n');
    });
  }

  protected abstract get diff(): Change[];
}

class ReplaceAction extends DocumentChange {
  constructor(before: AccessNode, after: AccessNode, name: string) {
    super();
  }

  get diff(): Change[] {
    return diffLines(scrubId(before), scrubId(after))
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
