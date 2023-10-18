import { inspect } from 'node:util';
import React, { useEffect, useRef, useState } from 'react';
import {observer} from 'mobx-react-lite';
import { action, autorun, reaction, toJS } from 'mobx';
import { Box, measureElement, Text, useApp, useFocusManager } from 'ink';
import { LayoutColumn, LayoutRow } from '../../components/Layouts.js';
import { Gate, Route } from '../../components/Conditional.js';
import PathBar from '../../components/PathBar.js';
import ActionMenu from '../../components/ActionMenu.js';
import ActionLogger from '../../components/ActionLogger.js';
import FileViewer from '../../components/FileViewer.js';
import NotImplemented from '../../components/NotImplemented.js';
import useScreenSize from '../../hooks/useScreenSize.js';
import { InspectMenus } from './inspect-actions.js';
import { MenuOption } from '../../utils/menu.js';
import { subcommand_opts, file_op_options, InspectState } from './inspect-model.js';
import { Provider, RootStore, useStore } from './inspect-store.js';
import logger from '../../../util/log.js';

const log = logger.getLogger(import.meta.url);


const inspect_defaults = {
  getters: 'get' as const,
  colors: true,
  depth: 5,
  compact: true,
  breakLength: 80
}



const InspectScreen: React.FC = observer(() => {
  const { exit } = useApp();
  const { width, height } = useScreenSize();

  const contentArea = useRef();
  const [ dimensions, setDimensions ] = useState({ width, height });

  const [ store ] = useState(() => useStore());
  const { tick, epub, ui, selections } = store;

  let { messages, location, focus } = ui;
  let { subcommand, file, operation } = selections;

  const closeMenu = action((menu: InspectMenus) => {
    switch (menu) {
      case InspectMenus.subcommand:
        [operation, file, subcommand].forEach(sel => sel.clear());
        break;
      case InspectMenus.file:
        [operation, file].forEach(sel => sel.clear());
        break;
      case InspectMenus.file_action:
        [operation].forEach(sel => sel.clear());
        break;
    }
  });

  const selectFromMenu = action((menu: InspectMenus, selected: MenuOption<any>) => {
    //return;
    switch (menu) {
      case InspectMenus.subcommand:
        subcommand.select(selected.value);
        break;
      case InspectMenus.file:
        file.select(selected.value);
        break;
      case InspectMenus.file_action:
        operation.select(selected.value);
        break;
    }
  });


  useEffect(function measureScreen() {
    setDimensions(measureElement(contentArea.current));
  }, [ width, height ]);

  return (
    <LayoutColumn flexGrow={1}>

      <Box flexDirection={'column'} borderColor={'red'} borderStyle={'round'}>
        <Box>
          <Text>eSnub - ePub Inspect</Text>
        </Box>

        <Box>
          <Text>TickTock: {tick}</Text>
        </Box>

        <Box>
          <Text>Current location: {location}</Text>
        </Box>

        <Box>
          <Text>Current component: {focus}</Text>
        </Box>

        <PathBar base="Inspect" components={[ location ]} />
      </Box>

      <LayoutRow
        width={'100%'}
        flexGrow={1}
        overflow={'hidden'}
        ref={contentArea}>

        <Box>
          <Text>{inspect(toJS(store), inspect_defaults)}</Text>
        </Box>

        {/* First Menu */}
        {/* path: Inspect -> ... */}
        {/* todo path-string = /inspect/*\/*\/ */}
        <Route
          //when={() => operation.isNot('view-file')}
          //pattern="/inspect/:sub?/:op(!view-file)?"
          pattern="*"
          name="MainMenuFlow"
          component="#main-menu">

          <ActionMenu
            id="#main-menu"
            label="Inspect Options"
            isActive={focus === '#main-menu'}
            options={subcommand_opts}
            onSelect={item => {
              selectFromMenu(InspectMenus.subcommand, item);
              //push('/inspect/')
            }}
            onBack={exit}
            onQuit={exit} />

          {/* File Selector */}
          {/* path: Inspect -> Browse Contents -> ... */}
          {/* todo path-string = /inspect/files/ */}
          <Route pattern="/inspect/files/*" name="FileList" component="#file-list">
            <ActionMenu
              id="#file-list"
              label="Epub Contents"
              limit={12}
              options={epub.dir.map(e => ({ label: e.path, value: e.path }))}
              isActive={focus === '#file-list'}
              onBack={() => closeMenu(InspectMenus.file)}
              onSelect={item => selectFromMenu(InspectMenus.file, item)}
              onQuit={exit} />
          </Route>

          {/* Menu for selected file */}
          {/* path: Inspect -> Browse Contents -> [file selected] -> ... */}
          {/* todo path-string = /inspect/files/[file] */}
          <Gate when={() => /^\/insepct\/view-files\/.+$/.test(location) }>
            <ActionMenu
              id="#file-actions"
              label={'Options for ' + file}
              options={file_op_options}
              isActive={focus === '#file-actions'}
              onBack={() => closeMenu(InspectMenus.file_action)}
              onSelect={item => selectFromMenu(InspectMenus.file_action, item)}
              onQuit={exit} />
          </Gate>

          {/* todo path-string = /inspect/files/[file]/!view-file */}
          <Gate when={() => operation.isNot('view-file', true)}>
            <NotImplemented name="FileOperation" onBack={() => closeMenu(InspectMenus.file_action)} />
          </Gate>
        </Route>

        {/* FileViewer */}
        {/* path: Inspect -> Browse Contents -> [file selected] -> View File */}
        {/* todo path-string = /inspect/files/[file]/view-file */}
        <Gate when={() => operation.is('view-file')}>
          <Box flexGrow={1}>
            <FileViewer
              {...dimensions}
              file={epub.dir.find(f => f.path === file?.value.path)}
              epubPath={epub.path}
              onBack={() => closeMenu(InspectMenus.file_action)}
            />
          </Box>
        </Gate>

        {/* todo path-string = /inspect/manifest */}
        <Gate when={() => subcommand.is('manifest')}>
          <NotImplemented name="Manifest" onBack={() => closeMenu(InspectMenus.file)} />
        </Gate>

        {/* todo path-string = /inspect/manifest */}
        <Gate when={() => subcommand.is('config')}>
          <NotImplemented name="Config" onBack={() => closeMenu(InspectMenus.file)} />
        </Gate>

        <Route pattern="/*" name="CatchAll">
          <NotImplemented name="#no-match" onBack={() => closeMenu(InspectMenus.file)} />
        </Route>

      </LayoutRow>

      <Box flexGrow={0} width={'100%'}>
        <ActionLogger messages={messages.toArray()} />
      </Box>
    </LayoutColumn>
  );
});

export type InspectScreenProps = {
  filepath: string,
  opts: InspectCmdOpts;
  store: InspectState;
}
const InspectScreenStore: React.FC<InspectScreenProps> = observer(({ store, filepath, opts }) => {

  setInterval(() => {
    store.tock();
    console.log('Tick interval', store.tick)
  }, 1000);

  return (
    <Provider value={store}>
      <InspectScreen />
    </Provider>
  )
});

export default InspectScreenStore;
