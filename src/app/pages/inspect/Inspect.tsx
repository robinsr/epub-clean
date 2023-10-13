import React, { ReactNode, useEffect, useReducer } from 'react';
import { Box, useFocusManager, useApp } from 'ink';
import ActionMenu from '../../components/ActionMenu.js';
import LayoutColumn from '../../components/LayoutColumn.js';
import ActionLogger from '../../components/ActionLogger.js';
import FileViewer from '../../components/FileViewer.js';
import PathBar from '../../components/PathBar.js';
import inspectReducer from './inspect-reducer.js';
import { InspectMenus } from './inspect-actions.js';
import { InspectState } from './inspect-model.js';

type ConditionalProps = {
  when: () => boolean;
  readonly children?: ReactNode
}
const Conditional = ({ when, children }: ConditionalProps) => {
  if (when()) {
    return (<>{children}</>)
  }

  return null;
}

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
    if (subcommand.is('files')) {
      if (operation.is('view-file')) {
        focus('#file-viewer')
      }
      if (file.hasSelection()) {
        focus('FileActions');
      }
      if (file.isEmpty()) {
        focus('FileList');
      }
    }
  }, [ state ]);

  return (
    <LayoutColumn borderStyle="round" borderColor="white">
      <PathBar base="Inspect" components={[
        () => subcommand.getLabel(),
        file.getLabel(),
        operation.getLabel(),
      ]} />
      <LayoutColumn borderColor="red" borderStyle="round">
        <Conditional when={() => operation.is('view-file')}>
          <FileViewer
            file={file.getValue()}
            epubPath={epub.path}
            onBack={() => dispatch({
            type: 'MENU_CLOSE',
              data: {
                menu: InspectMenus.file_action
              }
            })}
          />
        </Conditional>
        <Conditional when={() => operation.isEmpty()}>
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
        {subcommand.is('files') &&
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
            onQuit={exit} />}
        {file.hasSelection() &&
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
          </Box>}
        </Conditional>
      </LayoutColumn>
      <Box width={50} borderColor="red">
        <ActionLogger message={message} />
      </Box>
    </LayoutColumn>
  );
}

export default InspectScreen;
