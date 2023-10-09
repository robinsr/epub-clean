import renderScreen from '../screens/App.js';
import InspectScreen from '../screens/Inspect.js';


import logger from '../util/log.js';
import { extractFile, getDirectoryList, getManifest } from '../epub/fs.js';
import { EpubFile } from '../epub/mimetypes.js';
import { EpubPackage } from '../epub/manifest.js';

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }

  interface InspectData {
    path: string;
    dir: EpubFile[];
    manifest: EpubPackage
  }

  interface InspectUI {
    files: EpubFile[];
    showFiles: boolean;
    selectedFile: EpubFile | null;
    selectedAction: string | null;
    message: object | null;
  }

  interface InspectState {
    epub: InspectData;
    ui: InspectUI;
  }

  interface MenuOption {
    label: string;
    value: string;
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
    ui: {
      files: [],
      showFiles: false,
      selectedFile: null,
      selectedAction: null,
      message: null
    }
  };

  renderScreen(InspectScreen, { initialState });
}

run.filetypes = [];

export default run;
