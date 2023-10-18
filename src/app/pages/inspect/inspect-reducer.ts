import { InspectAction, InspectMenus } from './inspect-actions.js';
import { InspectState } from './inspect-model.js';


const inspectReducer = (state: InspectState, { type, data }: InspectAction): InspectState => {
  let newState = { ...state };

  newState.ui.messages = state.ui.messages.clone().push({ type, data });

  if (type === 'MESSAGE') {
    return newState;
  }

  if (type === 'NAVIGATE') {
    // newState.ui.path = data.location.pathname;
    // newState.ui.component = data.location.hash;
    return newState;
  }

  if (type === 'MENU_SELECT') {
    let { menu, value } = data;
    let { subcommand, file, operation } = state.selections;

    switch (menu) {
      case InspectMenus.subcommand:
        //newState.selections.subcommand = subcommand.select(value);
        break;
      case InspectMenus.file:
        //newState.selections.file = file.select(value);
        let filepath = encodeURIComponent(value.path);
        break;
      case InspectMenus.file_action:
        //newState.selections.operation = operation.select(value);

        break;
    }

    return newState;
  }

  if (type === 'MENU_CLOSE') {
    let { subcommand, file, operation } = state.selections;

    if (file.hasSelection) {
      //newState.selections.operation = operation.clear();
      // newState.selections.file = file.clear();
    } else if (subcommand.hasSelection) {
      // newState.selections.subcommand = subcommand.clear();
    }

    return newState;
  }

  throw Error(`Unknown action "${type}`);
}

export default inspectReducer;
