import logger from '../../util/log.js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { Adapter } from './../dom.js';
import FileDiff from '../../diff/FileDiff.js';
import { fileURLToPath } from 'node:url';

const log = logger.getLogger(import.meta.url);

class FileAdapterImpl implements Adapter {

  constructor(public filename: string) {
    log.debug('Creating FileAdapter for file: ', filename);
  }

  getContents(): string {
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
    return this.filename;
  }
}


const FileAdapter = (filename: string): Adapter => {
  return new FileAdapterImpl(filename);
}

export default FileAdapter;
