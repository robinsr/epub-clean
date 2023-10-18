import React, { ReactNode, useContext, useEffect, useState } from 'react';
import useRoutes from '../hooks/useRoutes.js';
import useLocation from '../hooks/useLocation.js';
import { useStore } from '../pages/inspect/inspect-store.js';

type RouteData = {
  /*
   * Useful short name for route
   */
  name: string;

  /*
   * Component that should get focus when route matches
   */
  component?: string;

}


type RouteProps = {
  pattern: string;
  name: string;
  component?: string;
  readonly children?: ReactNode
}
export const Route = ({ pattern, name, component, children }: RouteProps) => {
  const { isMatch, route, params, path } = useRoutes<RouteData, any>(pattern, { name, component });
  //const { component: focusOn } = route.data;

  const { ui } = useStore();

  useEffect(() => {
    ui.logMessage({
      type: 'MESSAGE',
      data: {
        pattern, location: path, isMatch, data: route?.data, params
      }
    })
  }, [ isMatch ]);

  if (isMatch) {
    return (<>{children}</>);
  } else {
    return null;
  }
}

/**
 * Use a callback function to determine rendering of children
 */
type GateProps = {
  when: () => boolean;
  readonly children?: ReactNode
}
export const Gate = ({ when, children }: GateProps) => {
  if (when && when()) {
    return (<>{children}</>);
  } else {
    return null;
  }
}
