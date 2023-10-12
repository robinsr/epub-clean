import logger from '../util/log.js';
import renderScreen from '../app/App.js';
import InspectScreen from '../app/Inspect.js';
import { getDirectoryList, getManifest } from '../epub/fs.js';
import { InspectState } from '../app/reducers/inspect-reducer.js';
import { MenuOption, SelectMenu } from '../app/menu.js';
import { EpubFile } from '../epub/mimetypes.js';
import { basename, extname } from 'node:path';
import { sortByGetter } from '../util/sort.js';

const log = logger.getLogger(import.meta.url);

declare global {
  interface InspectCmdOpts {
    // manifest: boolean;
    // filetype?: FileCategory;
  }
}

let fileSorter = sortByGetter<EpubFile>(e => {
    return basename(e.path, extname(e.path));
});


const subcommand_opts = [
  { value: 'manifest', label: 'View Manifest (.opf file)' },
  { value: 'config', label: 'Configure transforms' },
  { value: 'files', label: 'Browse Contents' },
];

let file_op_options = [
  { value: 'view-file', label: 'View File'},
  { value: 'list-selectors', label: 'List Selectors' },
  { value: 'show-diff', label: 'Preview Changes' },
  { value: 'format', label: 'Reformat' },
  { value: 'delete', label: 'Delete' },
];


async function run(filename: string, opts: InspectCmdOpts) {
  let epubDir = await getDirectoryList(filename);
  let manifest = await getManifest(filename);

  let epubFileMenuOpts: MenuOption<EpubFile>[] = epubDir
    .sort(fileSorter)
    .map(file => ({
      key: file.path,
      label: file.path,
      value: file,
  }));

  const initialState: InspectState = {
    epub: {
      path: filename,
      dir: epubDir,
      manifest: manifest
    },
    selections: {
      subcommand: SelectMenu.from<string>(subcommand_opts),
      file: SelectMenu.from<EpubFile>(epubFileMenuOpts),
      operation: SelectMenu.from<string>(file_op_options)
    },
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
