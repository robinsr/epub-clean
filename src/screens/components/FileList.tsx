import React, { type FC, ReactNode, useState } from 'react';
import { Box, Text, render, useFocus, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { basename, extname } from 'node:path';
import { EpubFile } from '../../epub/mimetypes.js';
import { sortByGetter } from '../../util/sort.js';
import { isNonNull } from 'remeda';
import ActionMenu from './ActionMenu.js';

let fileSorter = sortByGetter<EpubFile>(e => {
    return basename(e.path, extname(e.path));
});

type FileListProps = {
  files: EpubFile[];
  filter: string; // mimetype
  onBack: () => void;
  onSelect: (file: EpubFile, action: string) => void;
  onQuit: () => void;
}

const FileList = ({ files = [], filter, onBack, onSelect, onQuit }: FileListProps) => {
  const { isFocused } = useFocus({ id: 'file-list' });
  const [ selectedFile, setSelectedFile ] = useState<EpubFile>(null);

  const [ highlighted, setHighlighted ] = useState({
    label: null, value: null
  });

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (input === 'q') {
      onQuit();
    }

    if (input === 'b') {
      onBack();
    }

    if (key.leftArrow) {
      onBack();
    }

    if (key.rightArrow) {
      handleSelect(highlighted);
    }
  });

  const handleSelect = item => {
		setSelectedFile(files.find(file => file.path === item.value));
	};

  const handleHighlight = item => {
    setHighlighted(item);
  }

  const doWithFile = (action: string) => {
    onSelect(selectedFile, action);
    setSelectedFile(null);
  }

  let items = files.sort(fileSorter).map(file => ({
    label: file.path, value: file.path
  }));

  let fileOptions = [ 'View', 'Reformat', 'Delete', 'View Selectors' ];

  if (!files.length) {
    return null;
  }

  return (
    <Box
      borderStyle="round"
      borderColor={isFocused ? 'blueBright' : 'blue'}
      flexDirection="column"
      paddingLeft={1}
      paddingRight={1}>
      <Box flexDirection="row" borderStyle="round">
        <Text>{selectedFile ? selectedFile.path : 'No file Selected'}</Text>
        <Box width={50}>
          <SelectInput
            limit={12}
            items={items}
            isFocused={!selectedFile}
            onSelect={handleSelect}
            onHighlight={handleHighlight}/>
        </Box>
        <Box width={50}>
          <ActionMenu
            name={`action-menu-${selectedFile ? selectedFile.path : 'nothing'}`}
            options={fileOptions}
            isVisible={isNonNull(selectedFile)}
            isFocused={isNonNull(selectedFile)}
            onSelect={doWithFile}
            onBack={() => setSelectedFile(null)}/>
        </Box>
      </Box>
    </Box>
  );
}

export default FileList;