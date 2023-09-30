import { diffChars } from 'diff';
import { AccessNode, DomAdapter } from '../dom/index.js';
import DocumentChange, { ChangeType } from './DocChange.js';
import { PrintableDiff } from './PrintableDiff.js';

class RemoveAction extends PrintableDiff implements DocumentChange {
  type = 'REMOVE-NODE' as const;

  constructor(
    public target: AccessNode,
    public taskName: string) {
    super();

    this.diff = diffChars(this.target.domString, '');
    this.newLines = false;
    this.label = [this.taskName, this.target.id, this.type.red].join(' ');
  }

  applyChange(adapter: DomAdapter): void {
    let oldNode = adapter.get(this.target.id);
    oldNode && oldNode.remove();
  }
}

export default RemoveAction;
