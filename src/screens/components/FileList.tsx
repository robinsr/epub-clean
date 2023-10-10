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
import { Action } from '../reducers/actions.js';
import useBorderFocus from '../hooks/useBorderFocus.js';

let fileSorter = sortByGetter<EpubFile>(e => {
    return basename(e.path, extname(e.path));
});

type FileListProps = {
  dispatch: React.Dispatch<Action>;
  label: string;
  files: EpubFile[];
  selectedFile: EpubFile;
  filter?: string; // mimetype
  onBack: () => void;
  onSelect: (file: EpubFile) => void;
  onAction: (action: string) => void;
  onQuit: () => void;
}

const FileList = ({ dispatch, label, files = [], selectedFile, onAction, onBack, onSelect, onQuit }: FileListProps) => {
  const { isFocused, borders } = useBorderFocus({ autoFocus: true, id: label });

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
  }, { isActive: isFocused });

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
    { label: 'View File', value: 'view-file' },
    { label: 'List Selectors', value: 'list-selectors' },
    { label: 'Preview Changes', value: 'show-diff' },
    { label: 'Reformat', value: 'format' },
    { label: 'Delete', value: 'delete' },
  ];

  return (
    <LayoutColumn>
      <Box>
        <LayoutRow>
          <Box flexGrow={0} {...borders}>
            <SelectInput
              limit={12}
              items={items}
              isFocused={isFocused}
              onSelect={handleSelect}
              onHighlight={handleHighlight}/>
          </Box>
          {selectedFile ?
            <Box flexGrow={0}>
              <ActionMenu
                id="FileActions"
                label={'Options for ' + selectedFile.path}
                options={fileActions}
                isActive={isNonNull(selectedFile)}
                onSelect={doWithFile}
                onBack={onBack}/>
            </Box>
          : null}
        </LayoutRow>
      </Box>
    </LayoutColumn>
  );
}

export default FileList;