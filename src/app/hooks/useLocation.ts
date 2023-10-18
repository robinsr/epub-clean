import { useEffect, useCallback } from 'react';

import PathMatcher from '../../util/path.js';
import { useStore } from '../pages/inspect/inspect-store.js';
import { autorun, observe } from 'mobx';
import logger from '../../util/log.js';

const log = logger.getLogger(import.meta.url);

const pathMatcher = new PathMatcher();


type LocationItems = {
  location: string;
  pathMatcher: PathMatcher
}

const useLocation = (() => {
  let { ui } = useStore();

  useCallback(() => {
    log.debug('(useLocation) registering observer function');
    autorun(() => {
      log.debug(`useCallback - autorun of "ui.location" - value=${ui.location}`);
      pathMatcher.setLocation(ui.location);
    })
  }, [ ui.location ]);

  return { pathMatcher, location: pathMatcher.location };
})

export default useLocation;
