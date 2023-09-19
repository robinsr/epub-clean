import { existsSync, readFileSync } from 'fs';
import { Adapter } from './adapter.js';


const FileAdapter = (filename: string): Adapter => {
  return {
    getContents() {
      if (!filename) {
        throw new Error('No filename');
      }

      if (!existsSync(filename)) {
        throw new Error(`File not found: ${filename}`);
      }

      return readFileSync(filename, 'utf8');
    }
  }
}

export default FileAdapter;
