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
  id?: string;
  label: string;
  files: EpubFile[];
  selected: EpubFile;
  filter?: string; // TODO: Sort by mimetype
  onSelect?: (file: EpubFile) => void;
  onBack?: () => void;
  onQuit: () => void;
}

const FileList: React.FC<FileListProps> = ({ id, label, files = [], selected, onBack, onSelect, onQuit }) => {
  const { isFocused, borders } = useBorderFocus({ autoFocus: true, id: id || label });

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
  }, { isActive: isFocused });

  const handleSelect = item => {
		onSelect(files.find(opt => opt.path === item.value));
	};

  const handleHighlight = item => {
    setHighlighted(item);
  }

  return (
    <ActionMenu
      id={id}
      label={'Epub Contents'}
      limit={12}
      options={files.sort(fileSorter).map(f => ({
        label: f.path,
        value: f.path
      }))}
      isActive={isFocused}
      onSelect={handleSelect}
      onHighlight={handleHighlight}
      onBack={onBack}
    />
  );
}

export default FileList;