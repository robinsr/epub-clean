import callsites from 'callsites';
import colors from 'colors';
import { diffChars as dc, diffLines as dl } from 'diff';

const caller = () => {
  let caller = callsites()[2];
  let line_no = caller.getLineNumber();
  let filename = caller.getFileName();
  let name = filename.substring(filename.lastIndexOf('/') + 1);

  return { line_no, filename, name };
}

export const log = (...msg) => {
  let { line_no, filename, name } = caller();
  console.log(`${name}:${line_no}:`, ...msg);
}

export const debug = (...msg) => {
  return;
  let { line_no, filename, name } = caller();
  console.debug(`${name}:${line_no}:`, ...msg);
}


export const diffChars = (before, after, name) => {
  if (name) {
    console.log(`(${name}) diff:`);
  }

  return print(dc(before, after));
}

export const diffLines = (before, after, name) => {
  if (name) {
    console.log(`(${name}) diff:`);
  }

  return print(dl(before, after), true);
}

const print = (diff, line_break) => {
  diff.forEach(part => {
    // green for additions, red for deletions grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    process.stderr.write(part.value[color]);
    
    line_break && process.stderr.write('\n');
  });

  console.log();
}
