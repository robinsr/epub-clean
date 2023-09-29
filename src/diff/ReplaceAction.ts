import { diffChars, diffLines } from 'diff';
import { AccessNode, DomAdapter } from '../dom/index.js';
import DocChange from './DocChange.js';


class ReplaceAction extends DocChange {
  type = 'REPLACE-NODE' as const;

  constructor(
    public before: AccessNode,
    public after: AccessNode,
    public taskName: string) {
    super();

    this.diff = diffLines(this.before.domString, this.after.domString);
    this.label = [ this.taskName, this.before.id, this.type.yellow ].join(' ');
    this.newLines = true;
  }

  applyChange(adapter: DomAdapter): void {
    let oldNode = adapter.get(this.before.id);
    oldNode && oldNode.replace(this.after);
  }
}

export default ReplaceAction;
