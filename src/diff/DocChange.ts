import { Change } from 'diff';
import { difflog } from '../log.js'
import { DomAdapter } from '../dom/index.js';


export abstract class PrintableDiff {
  protected diff: Change[];
  protected label: string;
  protected newLines: boolean;

  public printDiff() {
    difflog.info(this.label);

    if (this.noChangePresent) {
      difflog.write(' - NO CHANGE\n');
    } else {
    }
    this.diff.forEach(part => {
      // green for additions, red for deletions grey for common parts
      const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
      difflog.write('\t' + part.value[color]);

      this.newLines && difflog.write('\n');
    });

    difflog.info();
  }

  public get noChangePresent(): boolean {
    return this.diff.some(part => !part.added && !part.removed);
  }
}

export type ChangeType = 'REMOVE-NODE' | 'REPLACE-NODE' | 'MODIFY-NODE';

abstract class DocumentChange extends PrintableDiff {
  public abstract get type(): ChangeType;
  public abstract applyChange(adapter: DomAdapter): void;
}

export default DocumentChange;
