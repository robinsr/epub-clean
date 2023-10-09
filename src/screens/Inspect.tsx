import React, { useState, useEffect, useReducer } from 'react';
import { Box, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import { isNonNull, isEmpty } from 'remeda';
import FileList from './components/FileList.js';
import ActionMenu from './components/ActionMenu.js';
import LayoutColumn from './components/LayoutColumn.js';
import LayoutRow from './components/LayoutRow.js';
import { ActionLogger } from './components/action-logger.js';

interface Action {
  type: string;
  data?: object;
}

interface MenuSelectAction extends Action {
  type: 'MENU_SELECT',
  data: {
    menuName: string;
    selectedValue: any;
  }
}

interface BackAction extends Action {
  type: 'BACK';
}

type InspectAction = MenuSelectAction | BackAction;


const inspectReducer = (state: InspectState, action: InspectAction): InspectState => {
  let newState = { ...state };

  newState.ui.message = action;

  if (action.type === 'MENU_SELECT') {
    switch (action.data.menuName) {
      case 'InspectOptions':
        newState.ui.files = state.epub.dir;
        newState.ui.showFiles = true;
        break;
      case 'FileSelect':
        newState.ui.selectedFile = state.epub.dir.find(f => {
          return f.path === action.data.selectedValue
        });
        break;
      case 'FileAction':
        newState.ui.selectedAction = action.data.selectedValue;
        break;
    }

    return newState;
  }

  if (action.type === 'BACK') {
    if (state.ui.selectedFile) {
      newState.ui.selectedFile = null;
    }

    if (state.ui.files) {
      newState.ui.files = [];
      newState.ui.showFiles = false;
    }

    return newState;
  }

  throw Error('Unknown action');
}

const inspectCmdMenu = [
  { label: 'View Manifest (.opf file)', value: 'manifest' },
  { label: 'Configure transforms', value: 'config' },
  { label: 'Browse Contents', value: 'browse' },
];


export type InspectScreenProps = {
  initialState: InspectState;
}
const InspectScreen = ({ initialState }: InspectScreenProps) => {
  const { exit } = useApp();
  const { isFocused } = useFocus();
  const [ state, dispatch ] = useReducer(inspectReducer, initialState);

  let { epub, ui } = state;
  let { message, files, selectedFile, showFiles, selectedAction } = ui;


  return (
    <LayoutColumn borderColor="blue" borderStyle="round">
      <Box>
        { selectedFile ?
          <Text>Nice! Let's "{selectedAction}" on file "{selectedFile.path}"</Text> :
          <Text>Waiting for selection</Text>
        }
      </Box>
      <LayoutColumn borderColor="red" borderStyle="round">
        <Box>
          <ActionMenu
            label="Inspect Options"
            isVisible={!isNonNull(selectedAction) && files.length === 0}
            isFocused={!isNonNull(selectedAction) && files.length === 0}
            options={inspectCmdMenu}
            onSelect={item => dispatch({
              type: 'MENU_SELECT',
              data: {
                menuName: 'InspectOptions',
                selectedValue: item
              }
            })}
            onBack={exit}/>
          <FileList
            files={files}
            filter={null}
            isVisible={files.length > 0}
            selectedFile={selectedFile}
            onBack={() => dispatch({ type: 'BACK' })}
            onAction={action => dispatch({
              type: 'MENU_SELECT',
              data: {
                menuName: 'FileAction',
                selectedValue: action
              }
            })}
            onSelect={item => dispatch({
              type: 'MENU_SELECT',
              data: {
                menuName: 'FileSelect',
                selectedValue: item.path
              }
            })}
            onQuit={exit} />
        </Box>
      </LayoutColumn>
      <Box width={50} borderColor="red">
        <ActionLogger message={message} />
      </Box>
    </LayoutColumn>
  );
}

export default InspectScreen;
