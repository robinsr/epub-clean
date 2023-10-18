import { EpubFile } from '../../../epub/mimetypes.js';
import { MenuOption, SelectMenu } from '../../utils/menu.js';
import { EpubPackage } from '../../../epub/manifest.js';
import { getDirectoryList, getManifest } from '../../../epub/fs.js';
import { basename, extname } from 'node:path';
import { sortByGetter } from '../../../util/sort.js';
import { Stack } from '@datastructures-js/stack';

export interface InspectState {
  tick: number;
  ui: InspectUI;
  selections: MenuSelections;
  epub: EpubContext;
  tock: () => void;
}

export interface InspectUI {
  location: string;
  focus: string;
  messages: Stack<object>;
  logMessage: (...obj: any[]) => void;
}

export interface MenuSelections {
  subcommand?: SelectMenu<string>;
  file?: SelectMenu<EpubFile>;
  operation?: SelectMenu<string>;
}

export interface EpubContext {
  path: string;
  dir: EpubFile[];
  manifest: EpubPackage
}


export const subcommand_opts: MenuOption<string>[] = [
  { value: 'manifest', label: 'View Manifest (.opf file)' },
  { value: 'config', label: 'Configure transforms' },
  { value: 'files', label: 'Browse Contents' },
];


export const file_op_options: MenuOption<string>[] = [
  { value: 'view-file', label: 'View File'},
  { value: 'list-selectors', label: 'List Selectors' },
  { value: 'show-diff', label: 'Preview Changes' },
  { value: 'format', label: 'Reformat' },
  { value: 'delete', label: 'Delete' },
];



// export const getInitialState = async (filename: string): Promise<InspectState> => {
//   let epubDir = await getDirectoryList(filename);
//   let manifest = await getManifest(filename);
//
//   let fileSorter = sortByGetter<EpubFile>(e => basename(e.path, extname(e.path)));
//
//   let epubFileMenuOpts: MenuOption<EpubFile>[] = epubDir
//     .sort(fileSorter)
//     .map(file => ({
//       key: file.path,
//       label: file.path,
//       value: file,
//   }));
//
//   return {
//     epub: {
//       path: filename,
//       dir: epubDir,
//       manifest: manifest
//     },
//     selections: {
//       subcommand: SelectMenu.from<string>(subcommand_opts),
//       file: SelectMenu.from<EpubFile>(epubFileMenuOpts),
//       operation: SelectMenu.from<string>(file_op_options)
//     },
//     ui: {
//       files: [],
//       path: '/inspect',
//       focus: '#main-menu',
//       messages: new Stack<object>()
//     }
//   };
// }