import React, { Children, type ReactNode } from 'react';
import { Box, BoxProps, Text, useFocus } from 'ink';

type Props = {
  focusBorder?: boolean;
  readonly children?: ReactNode;
} & BoxProps;

export const LayoutColumn = ({
  focusBorder = false,
  children,
  ...props
}: Props) => {

  let isFocused = false;
  if (focusBorder) {
    isFocused = useFocus().isFocused;
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
