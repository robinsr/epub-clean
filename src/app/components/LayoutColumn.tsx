import React, { Children, useContext, type ReactNode } from 'react';
import { Box, BoxProps, Text, useFocus } from 'ink';
import DebugContext from '../hooks/debug-context.js';

type Props = {
  focusBorder?: boolean;
  readonly children?: ReactNode;
} & BoxProps;

export const LayoutColumn = ({
  focusBorder = false,
  children,
  ...props
}: Props) => {
  const debug = useContext(DebugContext);

  let isFocused = false;
  if (focusBorder) {
    isFocused = useFocus({
      autoFocus: false,
      isActive: false
    }).isFocused;
  }

  return (
    <Box
      borderColor={isFocused ? 'blueBright' : 'blue'}
      flexDirection="column"
      width="100"
      height="100"
      justifyContent={'flex-end'}
      alignItems={'stretch'}
      {...props}>
      {children}
      {/*<Box><Text>COLUMN</Text></Box>*/}
      {/*{Children.map(children, child =>*/}
      {/*  <Box borderStyle={'single'} borderColor={'green'}>{child}</Box>*/}
      {/*)}*/}
    </Box>
  );
};

export default LayoutColumn;
