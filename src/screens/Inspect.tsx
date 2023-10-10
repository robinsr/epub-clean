import React, { useState, useEffect, useReducer, useMemo } from 'react';
import { Box, Text, useFocusManager, useApp, useFocus, useInput } from 'ink';
import { isNonNull, isEmpty } from 'remeda';
import FileList from './components/FileList.js';
import ActionMenu from './components/ActionMenu.js';
import LayoutColumn from './components/LayoutColumn.js';
import { ActionLogger } from './components/ActionLogger.js';
import PathBar from './components/PathBar.js';
import inspectReducer from './reducers/inspect-reducer.js';
import { InspectMenus } from './reducers/inspect-actions.js';

import { SelectMenu } from './menu.js';


const sub_commands = [
  { value: 'manifest', label: 'View Manifest (.opf file)' },
  { value: 'config', label: 'Configure transforms' },
  { value: 'files', label: 'Browse Contents' },
];


export type InspectScreenProps = {
  initialState: InspectState;
}
const InspectScreen: React.FC<InspectScreenProps> = ({ initialState }) => {
  const { exit } = useApp();
  const { disableFocus, focus } = useFocusManager();
  disableFocus();

  const [ state, dispatch ] = useReducer(inspectReducer, initialState);

  let { epub, ui, selections } = state;
  let { message, files, showFiles } = ui;
  let { subcommand, file, action } = selections;

  const SubCommands = useMemo(() => SelectMenu.fromOptions(sub_commands), []);

  if (subcommand) {
    SubCommands.select(subcommand);
  } else {
    SubCommands.clear();
  }

  SubCommands.isEmpty() && focus('MainMenu');
  SubCommands.is('files') && focus('FileList');
  SubCommands.is('files') && isNonNull(file) && focus('FileActions')

  return (
    <LayoutColumn borderColor="yellow" borderStyle="round">
      <PathBar label="Inspect" components={[
        () => subcommand ? SubCommands.getLabel() : null,
        () => file ? file.path : null,
        () => action ? action : null,
      ]} />
      <LayoutColumn borderColor="red" borderStyle="round">
        <Box>
          <ActionMenu
            id="MainMenu"
            label="Inspect Options"
            isActive={!isNonNull(subcommand)}
            options={sub_commands}
            onSelect={item => dispatch({
              type: 'MENU_SELECT',
              data: {
                menu: InspectMenus.subcommand,
                value: item
              }
            })}
            onBack={exit}/>
          {SubCommands.is('files') ?
            <FileList
              dispatch={dispatch}
              label="FileList"
              files={files}
              filter={null}
              selectedFile={file}
              onBack={() => dispatch({ type: 'BACK' })}
              onAction={action => dispatch({
                type: 'MENU_SELECT',
                data: {
                  menu: InspectMenus.file_action,
                  value: action
                }
              })}
              onSelect={item => dispatch({
                type: 'MENU_SELECT',
                data: {
                  menu: InspectMenus.file,
                  value: item.path
                }
              })}
              onQuit={exit} />
          : null}
        </Box>
      </LayoutColumn>
      <Box width={50} borderColor="red">
        <ActionLogger message={message} />
      </Box>
    </LayoutColumn>
  );
}

export default InspectScreen;
