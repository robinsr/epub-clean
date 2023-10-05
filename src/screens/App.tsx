import React, { type FC, ReactNode } from 'react';
import { Box, Spacer, Text, render, useApp, RenderOptions } from 'ink';
import KeyHelper from './components/KeyHelper.js';


type AppProps = {
  readonly children?: ReactNode;
}

const TerminalContainer = ({ children }: AppProps) => {

  const { exit } = useApp();

  return (
    <Box
      flexDirection="column"
      width="100%"
      height="100%"
      justifyContent={'flex-end'}
      alignItems={'stretch'}
    >
      <Box flexGrow={1}>
        {children}
      </Box>
      <Box flexGrow={0}>
        <KeyHelper />
        <Spacer />
        <Text color="gray">Press "q" to exit</Text>
      </Box>
    </Box>
  );
}

const ink_opts: RenderOptions = {
  patchConsole: true
}

export default function renderScreen<T,>(
  Screen: FC<T>,
  initialState: T
) {

  render(
    <TerminalContainer>
      <Screen {...initialState} />
    </TerminalContainer>,
    ink_opts
  );
}

