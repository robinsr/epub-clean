import logger from '../../util/log.js'
import PathMatcher, { RouteConfig, RouteMatch } from '../../util/path.js';
import useLocation from './useLocation.js';

const log = logger.getLogger(import.meta.url);


type RouteData = {
  component: string;
}

const useRoutes = <D, P extends object> (pattern: string, data?: D): RouteMatch<D, P>  => {
  const { location, pathMatcher } = useLocation();

  pathMatcher.addRoute(pattern)

  let isMatch = pathMatcher.pathIs(pattern);
  let route;

  if (isMatch) {
    //params = pathMatcher.params(pattern);
    route = pathMatcher.exec<D, P>(pattern, location);
  } else {
    route = { isMatch: false, route: null, params: {} }
  }

  return route;
}

export default useRoutes;

// const routes: Route[] = [
//   { pattern: '/inspect*', component: '#main-menu' },
//   { pattern: '/inspect/files', component: '#file-list' },
//   { pattern: '/inspect/files/:filename', component: '#file-actions' },
//   { pattern: '/inspect/files/:filename/:operation', component: '#file-list' },
//   { pattern: '/inspect/files/:filename/view-file', component: '#file-viewer' },
//   { pattern: '/*', component: '#no-match' },
// ];


// routes.forEach(route => {
//   pathMatcher.addRoute(route.pattern, { focusOn: route.pattern })
// })
