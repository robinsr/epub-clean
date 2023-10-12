import React, { useState, useEffect} from 'react';
import { Box, Newline, Spacer, Text, useApp, useFocus, useInput } from 'ink';
import SelectInput from 'ink-select-input';
import useBorderFocus from '../hooks/useBorderFocus.js';
import { MenuOption } from '../menu.js';

type ActionMenuProps<T> = {
  id: string;
  options: MenuOption<T>[]
  isActive: boolean;
  label?: string;
  limit?: number;
  onSelect: (item: MenuOption<T>) => void;
  onHighlight?: (item: MenuOption<T>) => void;
  onBack: () => void;
  onQuit: () => void;
}
const ActionMenu = <T,>({ id, label, options, limit, isActive, onSelect, onBack, onQuit, ...props }: ActionMenuProps<T>) => {
  const { isFocused, borders } = useBorderFocus({ id, isActive });

  const heading = `${label} (${isFocused})`;

  const [ highlighted, setHighlighted ] = useState<MenuOption<T>>(options.at(0));

  useInput((input, key) => {
    if (!isFocused) {
      return;
    }

    if (input === 'q') {
      return onQuit();
    }

    if (input === 'b') {
      return onBack();
    }

    if (key.leftArrow) {
      return onBack();
    }

    if (key.rightArrow) {
      handleSelect(highlighted);
    }
  }, { isActive: isFocused });

  const handleHighlight = (item: MenuOption<T>) => {
    setHighlighted(item);
  }

  const handleSelect = (item: MenuOption<T>) => {
    onSelect(options.find(opt => Object.is(opt.value, item.value)));
  }

  return (
    <Box>
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
          <SelectInput
            items={options}
            limit={limit}
            onSelect={handleSelect}
            onHighlight={handleHighlight}
            isFocused={isFocused}
            {...props} />
        </Box>
      </Box>
    </Box>
  );
}

export default ActionMenu;
