import { existsSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import FileAdapter from './dom/adapter/file-adapter.js';
import JSDOMAdapter from './dom/adapter/jsdom-adapter.js';
import TaskRunner from './tasks/task-runner.js';
import getTask from './tasks.js';
import { log, diffChars, diffLines } from './log.js';


async function run(filename, opts) {

  console.time('clean');

  const adapter = JSDOMAdapter(FileAdapter(filename));
  const taskRunner = TaskRunner(adapter, opts);

  const modified_html = adapter.contents.replace(/<body[\w\W]+<\/body>/, adapter.body);

  if (opts.fullDiff) {
    diffLines(adapter.contents, modified_html, 'All Changes');
  }

  let file_out = filename;
  if (opts.debug) {
    file_out = new URL('../test/test-output.html', import.meta.url);
  }

  if (!global.__opts.dryrun) {
    log(`Writing results to ${file_out}`);
    writeFileSync(file_out, modified_html);
  }
  console.timeEnd('clean');
}


export default run;
