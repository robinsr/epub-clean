import logger from '../util/log.js';
import renderScreen from '../screens/App.js';
import InspectScreen from '../screens/Inspect.js';
import { extractFile, getDirectoryList, getManifest } from '../epub/fs.js';
import { EpubFile } from '../epub/mimetypes.js';
import { EpubPackage } from '../epub/manifest.js';

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }

  interface EpubContext {
    path: string;
    dir: EpubFile[];
    manifest: EpubPackage
  }

  interface MenuSelections {
    subcommand?: string;
    file?: EpubFile;
    action?: string | null;
  }

  interface InspectUI {
    files: EpubFile[];
    showFiles: boolean;
    message: object | null;
  }

  interface InspectState {
    epub: EpubContext;
    selections: MenuSelections;
    ui: InspectUI;
  }
}

const log = logger.getLogger(import.meta.url);

async function run(filename: string, opts: InspectCmdOpts) {
  let epubDir = await getDirectoryList(filename);
  let manifest = await getManifest(filename);

  const initialState: InspectState = {
    epub: {
      path: filename,
      dir: epubDir,
      manifest: manifest
    },
    selections: {},
    ui: {
      files: [],
      showFiles: false,
      message: null
    }
  };

  renderScreen(InspectScreen, { initialState });
}

run.filetypes = [];

export default run;
