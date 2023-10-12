import React, { useEffect, useReducer } from 'react';
import { Box, useFocusManager, useApp } from 'ink';
import ActionMenu from './components/ActionMenu.js';
import LayoutColumn from './components/LayoutColumn.js';
import { ActionLogger } from './components/ActionLogger.js';
import PathBar from './components/PathBar.js';
import inspectReducer, { InspectState } from './reducers/inspect-reducer.js';
import { InspectMenus } from './reducers/inspect-actions.js';

export type InspectScreenProps = {
  initialState: InspectState;
}
const InspectScreen: React.FC<InspectScreenProps> = ({ initialState }) => {
  const { exit } = useApp();
  const { disableFocus, focus } = useFocusManager();

  const [ state, dispatch ] = useReducer(inspectReducer, initialState);

  let { epub } = state;
  let { message } = state.ui;
  let { subcommand, file, operation } = state.selections;

  useEffect(() => {
    // Basically a router. Where to focus based on current state
    if (subcommand.isEmpty()) {
      focus('MainMenu');
    }
    if (subcommand.is('files') && file.isEmpty()) {
      focus('FileList');
    }
    if (subcommand.is('files') && file.hasSelection()) {
      focus('FileActions');
    }
  }, [ state ]);

  return (
    <LayoutColumn borderColor="yellow" borderStyle="round">
      <PathBar base="Inspect" components={[
        () => subcommand.getLabel(),
        file.getLabel(),
        operation.getLabel(),
      ]} />
      <LayoutColumn borderColor="red" borderStyle="round">
        <Box>
          <ActionMenu
            id="MainMenu"
            label="Inspect Options"
            isActive={subcommand.isEmpty()}
            options={subcommand.options}
            onSelect={item => dispatch({
              type: 'MENU_SELECT',
              data: {
                menu: InspectMenus.subcommand,
                value: item.value
              }
            })}
            onBack={exit}
            onQuit={exit} />
          {subcommand.is('files') ?
            <ActionMenu
              id="FileList"
              label="Epub Contents"
              limit={12}
              options={file.options}
              isActive={file.isEmpty()}
              onBack={() => dispatch({
                type: 'MENU_CLOSE',
                data: {
                  menu: InspectMenus.file
                }
              })}
              onSelect={item => dispatch({
                type: 'MENU_SELECT',
                data: {
                  menu: InspectMenus.file,
                  value: item.value
                }
              })}
              onQuit={exit} />
          : null}
          {file.hasSelection() ?
            <Box flexGrow={0}>
              <ActionMenu
                id="FileActions"
                label={'Options for ' + file.getValue()?.path}
                options={operation.options}
                isActive={operation.isEmpty()}
                onBack={() => dispatch({
                  type: 'MENU_CLOSE',
                  data: {
                    menu: InspectMenus.file_action
                  }
                })}
                onSelect={action => dispatch({
                  type: 'MENU_SELECT',
                  data: {
                    menu: InspectMenus.file_action,
                    value: action.value
                  }
                })}
                onQuit={exit} />
            </Box>
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
