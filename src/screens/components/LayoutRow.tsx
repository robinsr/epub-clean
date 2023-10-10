import React, { type ReactNode, FC, FunctionComponent, Children } from 'react';
import { Box, BoxProps, Text, useFocus } from 'ink';

type RowProps = {
  focusBorder?: boolean;
  readonly children?: ReactNode;
} & BoxProps;

export const LayoutRow: FunctionComponent<RowProps> = ({
  focusBorder = false,
  children,
  ...props
}) => {

  let isFocused = false;
  if (focusBorder) {
    isFocused = useFocus({ isActive: false }).isFocused;
  }

  return (
    <Box
      borderColor={isFocused ? 'blueBright' : 'blue'}
      flexDirection="row"
      width="100"
      height="100"
      justifyContent={'flex-start'}
      alignItems={'stretch'}
      {...props}>
      {children}
      {/*<Box><Text>ROW</Text></Box>*/}
      {/*{Children.map(children, child =>*/}
      {/*  <Box borderStyle={'single'} borderColor={'yellow'}>{child}</Box>*/}
      {/*)}*/}
    </Box>
  );
};

export default LayoutRow;
