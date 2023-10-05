import React, { useState, useEffect} from 'react';
import { Box, Newline, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import SelectInput from 'ink-select-input';


export interface Selection<T> {
  object: T;
  selected: string;
}

type ActionMenuProps = {
  name?: string;
  isVisible: boolean;
  options: string[];
  isFocused: boolean;
  onSelect: (s: string) => void;
  onBack: () => void;
}
const ActionMenu = ({ isVisible, options, name = 'no-name-action-menu', onBack, onSelect }: ActionMenuProps) => {

  const { isFocused: hasFocus } = useFocus({ id: name });

  let selectOptions = options.map(opt => {
    return { label: opt as string, value: opt };
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
      <Text color={'gray'}>Vis: {isVisible ? 'vis' : 'not-vis'}; Name: {name}</Text>
      <SelectInput items={selectOptions} onSelect={handleSelect} />
    </Box>
  );
}

export default ActionMenu;
