import React, { type FC, ReactNode, useState } from 'react';
import { Box, Text, render, useFocus, useInput, useApp } from 'ink';
import SelectInput from 'ink-select-input';
import { basename, extname } from 'node:path';
import { EpubFile } from '../../epub/mimetypes.js';
import { sortByGetter } from '../../util/sort.js';
import { isNonNull } from 'remeda';
import ActionMenu from './ActionMenu.js';
import LayoutRow from './LayoutRow.js';
import LayoutColumn from './LayoutColumn.js';

let fileSorter = sortByGetter<EpubFile>(e => {
    return basename(e.path, extname(e.path));
});

type FileListProps = {
  files: EpubFile[];
  selectedFile: EpubFile;
  filter?: string; // mimetype
  isVisible: boolean;
  onBack: () => void;
  onSelect: (file: EpubFile) => void;
  onAction: (action: string) => void;
  onQuit: () => void;
}

const FileList = ({ files = [], isVisible, selectedFile, onAction, onBack, onSelect, onQuit }: FileListProps) => {
  const { isFocused } = useFocus({ id: 'file-list' });

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

    if (selectedFile) {
      return;
    }
  });

  const handleSelect = item => {
		onSelect(files.find(file => file.path === item.value));
	};

  const handleHighlight = item => {
    setHighlighted(item);
  }

  const doWithFile = (action: string) => {
    onAction(action);
  }

  let items = files.sort(fileSorter).map(file => ({
    label: file.path, value: file.path
  }));

  let fileActions = [
    { label: 'View', value: 'view-file' },
    { label: 'List Selectors', value: 'list-selectors' },
    { label: 'Reformat', value: 'format' },
    { label: 'Delete', value: 'delete' },
  ];

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <LayoutColumn>
        <Box>
          <Text>{selectedFile ? selectedFile.path : 'No file Selected'}</Text>
        </Box>
        <Box>
          <LayoutRow>
            <Box flexGrow={0}>
              <SelectInput
                limit={12}
                items={items}
                isFocused={!selectedFile}
                onSelect={handleSelect}
                onHighlight={handleHighlight}/>
            </Box>
            <Box flexGrow={0}>
              <ActionMenu
                label={selectedFile ? selectedFile.path : 'no label'}
                options={fileActions}
                isVisible={isNonNull(selectedFile)}
                isFocused={isNonNull(selectedFile)}
                onSelect={doWithFile}
                onBack={onBack}/>
            </Box>
          </LayoutRow>
        </Box>
      </LayoutColumn>
    </>
  );
}

export default FileList;