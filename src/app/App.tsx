import React, { type FC, ReactNode, useState } from 'react';
import { Box, Spacer, Text, render, useApp, RenderOptions } from 'ink';
import { createMemoryHistory, History } from 'history'
import KeyHelper from './components/KeyHelper.js';
import { LayoutColumn } from './components/Layouts.js';
import DebugContext, { debugSettings } from './hooks/debug-context.js';
import HistoryContext from './hooks/history-context.js'
import useScreenSize from './hooks/useScreenSize.js';

import logger from '../util/log.js';
import { RootStore } from './pages/inspect/inspect-store.js';

const log = logger.getLogger(import.meta.url);

const his = createMemoryHistory({
  initialEntries: [
    '/inspect'
  ],
  initialIndex: 0
});


type AppProps = {
  readonly children?: ReactNode;
}
const TerminalContainer = ({ children }: AppProps) => {
  const { exit } = useApp();
  const { width, height } = useScreenSize();


  return (
    <DebugContext.Provider value={debugSettings}>
      <HistoryContext.Provider value={his}>
        <LayoutColumn width={width} height={height}>
          <Box flexGrow={1}>
            {children}
          </Box>
          <Box flexGrow={0}>
            <KeyHelper />
            <Spacer />
            <Text color="gray">Press "q" to exit</Text>
          </Box>
        </LayoutColumn>
      </HistoryContext.Provider>
    </DebugContext.Provider>
  );
}

const ink_opts: RenderOptions = {
  patchConsole: true
}

export default async function renderScreen<T,>(
  Screen: FC<T>,
  state: T
) {

  try {
    const { unmount, waitUntilExit, clear, rerender } = render(<></>, ink_opts);

    const refresh = () => {
      log.info('REFRESHING')
      return (
        <TerminalContainer>
          <Screen {...state} refresh={refresh} />
        </TerminalContainer>
      )
    }

    rerender(refresh());

    let exited = await waitUntilExit();
    //clear();
    return exited;
  } catch (e) {
    return e;
  }
}

