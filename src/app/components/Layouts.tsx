import React, { useContext, type ReactNode, forwardRef } from 'react';
import { Box, BoxProps } from 'ink';
import DebugContext from '../hooks/debug-context.js';

type LayoutProps = {
  debug?: boolean;
  readonly children?: ReactNode;
} & BoxProps;

const BaseLayout = forwardRef(({
  debug = false,
  children,
  ...props
}: LayoutProps, ref) => {
  // const debug = useContext(DebugContext);
  //
  // let isFocused = false;
  // if (focusBorder) {
  //   isFocused = useFocus({
  //     autoFocus: false,
  //     isActive: false
  //   }).isFocused;
  // }

  return (
    <Box
      // @ts-ignore
      ref={ref}
      borderStyle={debug ? 'round' : null}
      borderColor={debug ? 'magenta' : null}
      {...props}>
      {children}
    </Box>
  );
});

export const LayoutRow = forwardRef(({ children, ...props }: LayoutProps, ref) => {
  return (
    <BaseLayout
      ref={ref}
      flexDirection={'row'}
      justifyContent={'flex-start'}
      borderColor={'magenta'}
      {...props}>
      {children}
    </BaseLayout>
  );
});

export const LayoutColumn = forwardRef(({ children, ...props }: LayoutProps, ref) => {
  return (
    <BaseLayout
      ref={ref}
      flexDirection={'column'}
      flexWrap={'nowrap'}
      justifyContent={'space-between'}
      alignItems={'flex-start'}
      // borderStyle={'round'}
      // borderColor={'yellow'}
      {...props}>
      {children}
    </BaseLayout>
  );
});
