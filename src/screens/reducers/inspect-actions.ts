import { Action } from './actions.js';

export enum InspectMenus {
  subcommand,
  file,
  file_action
}

export interface MenuSelectAction extends Action {
  type: 'MENU_SELECT',
  data: {
    menu: InspectMenus,
    value: string;
  }
}

export interface BackAction extends Action {
  type: 'BACK';
}

export interface KeyAction extends Action {
  type: 'KEYPRESS';
  data: {
    source: string;
    input: string;
    keys: string[];
  }
}

export type InspectAction = MenuSelectAction | BackAction | KeyAction;