import * as diff from 'diff';
import * as process from 'process';
import * as console from 'console';
import { Change } from 'diff';





export const diffChars = (before = '', after  = '', name) => {
  if (name) {
    diffHeader(name);
  }

  return print(diff.diffChars(scrubId(before), scrubId(after)));
}

export const diffLines = (before = '', after = '', name?: string) => {
  if (name) {
    diffHeader(name);
  }

  return print(diff.diffLines(scrubId(before), scrubId(after)), true);
}

const print = (diff: Change[], line_break = false) => {
  diff.forEach(part => {
    // green for additions, red for deletions grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
    process.stderr.write('\t' + part.value[color]);

    line_break && process.stderr.write('\n');
  });

  console.log();
}