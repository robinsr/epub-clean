import { diffChars, diffLines } from 'diff';
import { AccessNode, Adapter, DomAdapter } from '../dom/index.js';
import DocChange from './DocChange.js';
import { PrintableDiff } from './PrintableDiff.js';


class ModifyAction extends PrintableDiff implements DocChange  {
  type = 'MODIFY-NODE' as const;

  constructor(
    public target: AccessNode,
    public takeFrom: AccessNode,
    public taskName: string) {
    super();

    this.diff = diffLines(this.target.domString, this.takeFrom.domString);

    this.label = [ this.taskName, this.target.id, this.type.cyan ].join(' '),
    this.newLines = true;
  }

  applyChange(adapter: DomAdapter): void {
    let oldNode = adapter.get(this.target.id);
    if (oldNode) oldNode.inner = this.takeFrom.inner;
  }
}

export default ModifyAction;
