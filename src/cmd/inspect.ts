import renderScreen from '../screens/App.js';
import InspectScreen from '../screens/Inspect.js';


import logger from '../util/log.js';
import { extractFile, getDirectoryList, getManifest } from '../epub/fs.js';
import { EpubFile } from '../epub/mimetypes.js';
import { EpubPackage } from '../epub/manifest.js';

interface MenuOpts {
  label: string;
  value: string | number;
}

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }

  interface InspectState {
    epub: {
      path: string;
      dir: EpubFile[];
      manifest: EpubPackage
    },
    files: EpubFile[];
    selectedFile: EpubFile | null;
    menuOptions: MenuOpts[]
  }

  interface MenuOption {
    label: string;
    value: string;
  }
}

const log = logger.getLogger(import.meta.url);

const menuOptions = [
  { label: 'View Manifest (.opf file)', value: 'manifest' },
  { label: 'Configure transforms', value: 'config' },
  { label: 'Browse Contents', value: 'browse' }
];

async function run(filename: string, opts: InspectCmdOpts) {
  let epubDir = await getDirectoryList(filename);
  let manifest = await getManifest(filename);

  const initialState: InspectState = {
    epub: {
      path: filename,
      dir: epubDir,
      manifest: manifest
    },
    files: [],
    selectedFile: null,
    menuOptions
  };

  renderScreen(InspectScreen, { initialState });
}

run.filetypes = [];

export default run;
