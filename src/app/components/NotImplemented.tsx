import React from 'react';
import { Box, Text, useInput } from 'ink';
import useBackKey, { backFn } from '../hooks/useBackKey.js';
import useBorderFocus from '../hooks/useBorderFocus.js';
import MenuHeader from './MenuHeader.js';

type Props = {
  onBack: backFn;
  name: string;
}

const NotImplemented = ({ name, onBack }: Props) => {
  useBackKey(onBack);

  const { borders } = useBorderFocus({
    showBorders: true,
    isActive: true,
    autoFocus: true,
    id: name
  });

  return (
    <Box flexDirection="column" {...borders}>
      <MenuHeader title={name}/>
      <Text>This does nothing</Text>
    </Box>
  );
}

export default NotImplemented;
