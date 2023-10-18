import React, { useCallback, useContext } from 'react';
import { Box, Text, Newline } from 'ink';
import { inspect } from 'node:util';
import DebugContext from '../hooks/debug-context.js';
import useScreenSize from '../hooks/useScreenSize.js';

const inspect_defaults = {
  colors: true,
  depth: 3,
  compact: true,
  breakLength: 100
}

type ActionLoggerProps = {
  messages?: object[];
};
const ActionLogger = ({ messages = [] }: ActionLoggerProps) => {
  const debug = useContext(DebugContext);
  const { width } = useScreenSize();

  const inspect_opts = Object.assign({}, inspect_defaults, { breakLength: width - 10 });

  let borders = {}

  if (debug.flexBorders) {
    borders = {
      borderStyle: 'round',
      borderColor: 'red'
    }
  }

  return (
    <Box {...borders} width={'100%'} height={9} overflow={'hidden'} flexDirection={'column'}>
      {messages.slice(Math.max(messages.length * -1, -7)).map((msg, i) => (
        <Text key={`message-${i}`}>{inspect(msg, inspect_opts)}</Text>
      ))}
    </Box>
  );
};

export default ActionLogger;
