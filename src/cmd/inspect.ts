import logger from '../util/log.js';
import renderScreen from '../app/App.js';
import InspectScreen from '../app/pages/inspect/Inspect.js';
import {default as ansi} from 'ansi-escapes';
import { RootStore } from '../app/pages/inspect/inspect-store.js';
import { autorun } from 'mobx';
import { result } from 'lodash';

const log = logger.getLogger(import.meta.url);

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }
}

async function run(filepath: string, opts: InspectCmdOpts) {
  //process.stdout.write(ansi.clearScreen);

  const store = new RootStore(filepath);

  autorun(() => {
    log.debug('Store tick changed:', store.tick)
  })

  renderScreen(InspectScreen, { filepath, opts, store })
    .then(result => {
      log.info(result);
    })
    .catch(err => {
      log.fatal(err);
    })
    .finally(() => {
      log.info('Inspect#run exiting');
    });
}

run.filetypes = [];

export default run;
