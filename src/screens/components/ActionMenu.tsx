import React, { useState, useEffect} from 'react';
import { Box, Newline, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import useBorderFocus from '../hooks/useBorderFocus.js';

export interface MenuOpts {
  label: string;
  value: string;
}

export interface Selection<T> {
  object: T;
  selected: string;
}

type ActionMenuProps = {
  id: string;
  label?: string;
  options: string[] | MenuOpts[]
  isActive: boolean;
  onSelect: (s: string) => void;
  onBack: () => void;
}
const ActionMenu = ({ id, label, options, isActive, onBack, onSelect }: ActionMenuProps) => {

  const { isFocused, borders } = useBorderFocus({ id, isActive });

  const heading = `${label} (${isFocused})`;

  let selectOptions = options.map(opt => {
    if (opt.value && opt.label) {
      return opt;
    } else {
      return { label: opt as string, value: opt };
    }
  });

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (input === 'b') {
      onBack();
      return;
    }

    if (key.leftArrow) {
      onBack();
      return;
    }
  }, { isActive: isFocused });

  const handleSelect = item => {
    onSelect(item.value);
  }

  return (
    <Box flexDirection="column" {...borders}>
        {label ?
          <Box flexGrow={0}>
            <Text color={'gray'}>
              {heading}
              <Newline />
              {'-'.repeat(heading.length)}
            </Text>
          </Box>
          : null}
      <Box flexGrow={1}>
        <SelectInput items={selectOptions} onSelect={handleSelect} isFocused={isFocused} />
      </Box>
    </Box>
  );
}

export default ActionMenu;
