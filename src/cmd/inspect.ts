import logger from '../util/log.js';
import renderScreen from '../app/App.js';
import InspectScreen from '../app/pages/inspect/Inspect.js';
import { getInitialState } from '../app/pages/inspect/inspect-model.js';

const log = logger.getLogger(import.meta.url);

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }
}

async function run(filename: string, opts: InspectCmdOpts) {
  const initialState = await getInitialState(filename);
  renderScreen(InspectScreen, { initialState });
}

run.filetypes = [];

export default run;
