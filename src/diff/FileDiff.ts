import { diffLines } from 'diff';
import { PrintableDiff } from './PrintableDiff.js';


class FileDiff extends PrintableDiff {

  constructor(
      private original: string,
      private updated: string,
      private filename: string) {
    super();

    this.diff = diffLines(this.original, this.updated);
    this.label = `All changes for ${this.filename}`;
    this.newLines = false;
  }
}

export default FileDiff;