import FileAdapter from './dom/adapter/file-adapter.js';
import JSDOMAdapter from './dom/adapter/jsdom-adapter.js';
import TaskRunner from './tasks/task-runner.js';
import { applog as log } from './log.js';
import { fileURLToPath } from 'node:url';



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

  let handle = FileAdapter(filename);
  const adapter = JSDOMAdapter(handle);
  const taskRunner = TaskRunner(adapter, opts);

  const modified_html = handle.getContents().replace(/<body[\w\W]+<\/body>/, adapter.body);

  if (opts.fullDiff) {
    handle.diffWith(modified_html);
  }

  if (opts.debug) {

    handle = FileAdapter(
      fileURLToPath(new URL('../test/test-output.html', import.meta.url))
    );
  }

  if (opts.dryrun) {
    log.info(`Writing results to ${handle.target}`);
    handle.saveContents(modified_html);
  }
  console.timeEnd('clean');
}


export default run;
