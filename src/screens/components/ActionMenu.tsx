import React, { useState, useEffect} from 'react';
import { Box, Newline, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import SelectInput from 'ink-select-input';

export interface MenuOpts {
  label: string;
  value: string;
}

export interface Selection<T> {
  object: T;
  selected: string;
}

type ActionMenuProps = {
  label?: string;
  isVisible: boolean;
  options: string[] | MenuOpts[]
  isFocused: boolean;
  onSelect: (s: string) => void;
  onBack: () => void;
}
const ActionMenu = ({ isVisible, options, label, onBack, onSelect }: ActionMenuProps) => {

  const { isFocused: hasFocus } = useFocus({ id: label });

  let selectOptions = options.map(opt => {
    if (opt.value && opt.label) {
      return opt;
    } else {
      return { label: opt as string, value: opt };
    }
  });

  useInput((input, key) => {
    if (!hasFocus) {
      return;
    }

    if (input === 'b') {
      onBack();
    }

    if (key.leftArrow) {
      onBack();
    }
  });

  const handleSelect = item => {
    onSelect(item.value);
  }

  if (!isVisible) {
    return null;
  }

  return (
    <Box flexDirection="column" borderStyle="round" borderColor={hasFocus ? 'blueBright' : 'blue'}>
      <Box flexGrow={0}>
        {label ? <Text color={'gray'}>{label}</Text> : null}
      </Box>
      <Box flexGrow={1}>
        <SelectInput items={selectOptions} onSelect={handleSelect} />
      </Box>
    </Box>
  );
}

export default ActionMenu;
