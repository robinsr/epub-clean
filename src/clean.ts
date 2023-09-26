import { writeFileSync } from 'fs';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import FileAdapter from './dom/adapter/file-adapter.js';
import JSDOMAdapter from './dom/adapter/jsdom-adapter.js';
import TaskRunner from './tasks/task-runner.js';
import { applog } from './log.js';
import * as diff from './file-diff.js'

const log = applog.getSubLogger({ name: 'clean' });

declare global {
  interface CleanCmdOpts {
    config: URL;
    debug: boolean;
    fullDiff: boolean;
    dryrun: boolean;
    targets: boolean;
  }
}

async function run(filename: string, opts: CleanCmdOpts) {
  console.time('clean');

  const adapter = JSDOMAdapter(FileAdapter(filename));
  const taskRunner = TaskRunner(adapter, opts);

  const modified_html = adapter.getContents().replace(/<body[\w\W]+<\/body>/, adapter.body);

  if (opts.fullDiff) {
    diff.diffLines(adapter.getContents(), modified_html, 'All Changes');
  }

  let file_out = filename;
  if (opts.debug) {
    file_out = new URL('../test/test-output.html', import.meta.url).toString();
  }

  if (opts.dryrun) {
    log.info(`Writing results to ${file_out}`);
    writeFileSync(file_out, modified_html);
  }
  console.timeEnd('clean');
}


export default run;
