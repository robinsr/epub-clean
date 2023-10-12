import { InspectAction, InspectMenus } from './inspect-actions.js';
import { EpubFile } from '../../epub/mimetypes.js';
import { EpubPackage } from '../../epub/manifest.js';
import { SelectMenu } from '../menu.js';

export interface EpubContext {
  path: string;
  dir: EpubFile[];
  manifest: EpubPackage
}

export interface MenuSelections {
  subcommand?: SelectMenu<string>;
  file?: SelectMenu<EpubFile>;
  operation?: SelectMenu<string>;
}

export interface InspectUI {
  files: EpubFile[];
  showFiles: boolean;
  message: object | null;
}

export interface InspectState {
  epub: EpubContext;
  selections: MenuSelections;
  ui: InspectUI;
}

const inspectReducer = (state: InspectState, action: InspectAction): InspectState => {
  let newState = { ...state };

  newState.ui.message = action;

  if (action.type === 'MENU_SELECT') {
    let { menu, value } = action.data;
    let { subcommand, file, operation } = state.selections;

    switch (menu) {
      case InspectMenus.subcommand:
        newState.selections.subcommand = subcommand.select(value);
        break;
      case InspectMenus.file:
        newState.selections.file = file.select(value);
        break;
      case InspectMenus.file_action:
        newState.selections.operation = operation.select(value);
        break;
    }

    return newState;
  }

  if (action.type === 'MENU_CLOSE') {
    let { subcommand, file, operation } = state.selections;

    if (file.hasSelection()) {
      newState.selections.operation = operation.clear();
      newState.selections.file = file.clear();
    } else if (subcommand.hasSelection()) {
      newState.selections.subcommand = subcommand.clear();
    }

    return newState;
  }

  throw Error('Unknown action');
}

export default inspectReducer;