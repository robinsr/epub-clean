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
  console.log(`[INFO] (${name}:${line_no}):`.cyan, ...msg);
}

export const info = (...msg) => {
  let { line_no, filename, name } = caller();
  console.log(`[INFO] (${name}:${line_no}):`.cyan, ...msg);
}

export const warn = (msg, ...rest) => {
  let { line_no, filename, name } = caller();
  console.warn(`[WARN] (${name}:${line_no}): ${msg}`.yellow, ...rest);
}

export const error = (msg, ...rest) => {
  let { line_no, filename, name } = caller();
  console.warn(`[ERROR] (${name}:${line_no}): ${msg}`.red.inverse, ...rest);
  console.trace();
}

export const debug = (...msg) => {
  return;
  let { line_no, filename, name } = caller();
  console.debug(`[DEBUG] (${name}:${line_no}):`, ...msg);
}


const scrubId = (str) => {
  return str.replaceAll(/\s?data-rid="[\d\w]+"\s?/g, '');
}

const diffHeader = name => {
  console.log('[DIFF] '.grey + `(${name}):`.white);
}

export const diffChars = (before = '', after  = '', name) => {
  if (name) {
    diffHeader(name);
  }

  return print(dc(scrubId(before), scrubId(after)));
}

export const diffLines = (before = '', after = '', name) => {
  if (name) {
    diffHeader(name);
  }

  return print(dl(scrubId(before), scrubId(after)), true);
}

const print = (diff, line_break) => {
  diff.forEach(part => {
    // green for additions, red for deletions grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    process.stderr.write('\t' + part.value[color]);
    
    line_break && process.stderr.write('\n');
  });

  console.log();
}
