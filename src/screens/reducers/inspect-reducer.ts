import { InspectAction, InspectMenus } from './inspect-actions.js';


const inspectReducer = (state: InspectState, action: InspectAction): InspectState => {
  let newState = { ...state };

  newState.ui.message = action;

  if (action.type === 'KEYPRESS') {
    return newState;
  }

  if (action.type === 'MENU_SELECT') {
    let { menu, value } = action.data;

    switch (menu) {
      case InspectMenus.subcommand:
        newState.selections.subcommand = value;
        newState.ui.files = state.epub.dir;
        newState.ui.showFiles = true;
        break;
      case InspectMenus.file:
        newState.selections.file = state.epub.dir.find(f => {
          return f.path === value
        });
        break;
      case InspectMenus.file_action:
        newState.selections.action = value;
        break;
    }

    return newState;
  }

  if (action.type === 'BACK') {
    if (state.selections.action) {
      newState.selections.action = null;
      return newState;
    }

    if (state.selections.file) {
      newState.selections.file = null;
      return newState;
    }

    if (state.selections.subcommand) {
      newState.selections.subcommand = null;
      newState.ui.files = [];
      newState.ui.showFiles = false;
      return newState;
    }

    return newState;
  }

  throw Error('Unknown action');
}

export default inspectReducer;
