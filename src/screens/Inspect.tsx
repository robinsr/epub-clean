import React, { useState, useEffect } from 'react';
import { Box, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import { basename, extname } from 'node:path';
import { EpubFile } from '../epub/mimetypes.js';
import { sortByGetter } from '../util/sort.js';
import { inspect } from 'node:util';
import KeyHelper from './components/KeyHelper.js';
import { isNonNull, isEmpty } from 'remeda';
import FileList from './components/FileList.js';
import ActionMenu from './components/ActionMenu.js';


export type InspectScreenProps = {
  initialState: InspectState;
}

const InspectScreen = ({ initialState }: InspectScreenProps) => {
  const { exit } = useApp();
  const { isFocused } = useFocus();
  const [ appState, setAppState ] = useState(initialState);
  const [ nextAction, setNextAction ] = useState(null);

  let { epub, files, selectedFile, menuOptions } = appState;

  const handleResult = (file: EpubFile, action: string) => {
    let newState = { ...appState };
    newState.selectedFile = file;
    setAppState(newState);
    setNextAction(null);
  }

  const handleMenuSelect = (action: string) => {
    let newState = { ...appState };
    newState.files = epub.dir;
    setAppState(newState);
    setNextAction(action);

    if (action === menuOptions[2].label) {
      // do something with browse contents
    }
  }

  const clearFiles = () => {
    let newState = { ...appState };
    newState.files = [];
    setAppState(newState);
    setNextAction(null);
  }


  return (
    <Box
      borderStyle="round"
      borderColor={isFocused ? 'blueBright' : 'blue'}
      flexDirection="column"
      width="100%"
      height="100%"
      justifyContent={'flex-end'}
      alignItems={'stretch'}>
      <Box>
        <Text>Line 1</Text>
        <Text>Line 2</Text>
        <Text>Line 3</Text>
        <Text>Line 4</Text>
        { selectedFile ?
          <Text>Nice! Let's "{nextAction}" on file "{selectedFile.path}"</Text> :
          <Text>Waiting for selection</Text>
        }
      </Box>
      <Box>
        <ActionMenu
          isVisible={!isNonNull(nextAction)}
          isFocused={!isNonNull(nextAction)}
          options={menuOptions.map(i => i.label)}
          onSelect={handleMenuSelect}
          onBack={exit}/>
        <FileList
          files={files}
          filter={null}
          onBack={clearFiles}
          onSelect={handleResult}
          onQuit={exit} />
      </Box>
    </Box>
  );
}

export default InspectScreen;
