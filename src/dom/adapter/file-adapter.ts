import { existsSync, readFileSync, writeFileSync } from 'fs';
import { Adapter, HTMLFileContents } from './../dom.js';
import FileDiff from '../../diff/FileDiff.js';
import { fileURLToPath } from 'node:url';


class FileAdapterImpl implements Adapter {

  constructor(public filename: string) {
  }

  getContents(): HTMLFileContents {
    if (!this.filename) {
        throw new Error('No filename');
      }

      if (!existsSync(this.filename)) {
        throw new Error(`File not found: ${this.filename}`);
      }

      return readFileSync(this.filename, 'utf8');
  }

  diffWith(updated: string) {
    new FileDiff(this.getContents(), updated, this.filename).printDiff();
  }

  saveContents(contents: string) {
    writeFileSync(this.filename, contents);
  }

  get target() {
    return fileURLToPath(this.filename);
  }
}


const FileAdapter = (filename: string): Adapter => {
  return new FileAdapterImpl(filename);
}

export default FileAdapter;
