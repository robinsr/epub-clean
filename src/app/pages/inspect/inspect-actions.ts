import { Action } from '../../reducers/actions.js';
import { Location } from 'history';

export enum InspectMenus {
  subcommand = 'subcommand',
  file = 'file',
  file_action = 'file_action'
}

export interface MenuSelectAction extends Action {
  type: 'MENU_SELECT',
  data: {
    menu: InspectMenus,
    value: any;
  }
}

export interface BackAction extends Action {
  type: 'MENU_CLOSE';
  data: {
    menu: InspectMenus
  }
}

export interface KeyAction extends Action {
  type: 'KEYPRESS';
  data: {
    source: string;
    input: string;
    keys: string[];
  }
}

export interface MsgAction extends Action {
  type: 'MESSAGE',
  data: any
}

export interface NavigateAction extends Action {
  type: 'NAVIGATE',
  data: {
    location: Location
  }
}

export type InspectAction = MenuSelectAction | BackAction |
  KeyAction | MsgAction | NavigateAction;
