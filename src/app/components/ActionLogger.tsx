import React, { useContext } from 'react';
import { Box, Text } from 'ink';
import { inspect } from 'node:util';
import DebugContext from '../hooks/debug-context.js';

const inspect_opts = {
  colors: true,
  depth: 3
}

type ActionLoggerProps = {
  message?: object;
  messages?: string[];
};
const ActionLogger: React.FC<ActionLoggerProps> = ({
  message, messages
}) => {
  const debug = useContext(DebugContext);

  let borders = {}

  if (debug.flexBorders) {
    borders = {
      borderStyle: 'round',
      borderColor: 'red'
    }
  }

  if (!message) {
    return null;
  }

  return (
    <Box {...borders}>
      <Text>{inspect(message, inspect_opts)}</Text>
    </Box>
  );
};

export default ActionLogger;
