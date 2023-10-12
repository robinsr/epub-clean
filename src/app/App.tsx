import React, { type FC, ReactNode, useState } from 'react';
import { Box, Spacer, Text, render, useApp, RenderOptions } from 'ink';
import KeyHelper from './components/KeyHelper.js';
import LayoutColumn from './components/LayoutColumn.js';
import DebugContext, { debugSettings } from './hooks/debug-context.js';



type AppProps = {
  readonly children?: ReactNode;
}

const TerminalContainer = ({ children }: AppProps) => {
  const { exit } = useApp();

  return (
    <DebugContext.Provider value={debugSettings}>
      <LayoutColumn borderStyle="round" borderColor="blue">
        <Box flexGrow={1}>
          {children}
        </Box>
        <Box flexGrow={0}>
          <KeyHelper />
          <Spacer />
          <Text color="gray">Press "q" to exit</Text>
        </Box>
      </LayoutColumn>
    </DebugContext.Provider>
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

