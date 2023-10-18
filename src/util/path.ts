import { match, parse, pathToRegexp, compile, MatchFunction, PathFunction } from 'path-to-regexp';
import { sumFn } from './number.js';
import { sortByPick } from './sort.js';

const sortByScore = sortByPick('score');

const regex_path_separator = '[^\\/#\\?]+';

/**
 * Maps negative lookaheads in patterns to sub-regexes
 * (to be compatible with path-to-regex)
 */
const mapLookaheads = (pattern: string): string => {
  const r = /\(\??!([a-zA-Z0-9_|?]+)\)/g;
  let match = r.exec(pattern);

  if (!match) {
    return pattern;
  }

  /**
   * todo: support inner negated optional params
   * (the issue being that the negated value needs to be
   * repeated in any succeeding parameter. eg:
   *   pattern -> /:foo/:bar(!secret)?/:baz?
   *     match -> /foo/secret  (because "secret" is valid for baz)
   *  no match -> /foo/secret/sauce
   */

  const optional = /\(\??!([^/#?]+)\)\?\//g;
  let hasInnerOptionalNegation = optional.exec(pattern);
  if (!!hasInnerOptionalNegation) {
    throw new TypeError('Inner negated optional params not supported');
  }

  return pattern.replace(r, function (_, terms) {
    return `((?!${terms})${regex_path_separator})`;
  });
}

/**
 * Maps free wildcards in patterns to unnamed parameters
 * (to be compatible with path-to-regex)
 * @param pattern
 */
const mapWildcards = (pattern: string): string => {
  const r = /(?<!\w)\*/g;
  let match = r.exec(pattern);

  if (!match) {
    return pattern;
  }

  return pattern.replace(r, (_, m) =>  `(.*)`);
}


type StringTransform = (str: string) => string;
const chain = (tchain: StringTransform[]): StringTransform => {
  return (str: string) => tchain.reduce((acc, chainFn) => chainFn(acc), str);
}

const mapPattern = chain([ mapWildcards, mapLookaheads ]);

/**
 * Gives a numerical score to a path token (single segment
 * of a larger pattern), with lower scores for more accepting
 * features (const = highest, wildcard = lowest)
 */
const scoreToken = (token: any): number => {
  if (typeof token === 'string') {
    return 10; // const parameter
  }

  if (typeof token.name === 'number') {
    return -7; // un-named parameter
  }

  if (typeof token.name === 'string') {
    if (token.modifier === '*') {
      return -6; // splat (named parameter)
    }

    if (token.modifier === '?') {
      return -5; // optional (named parameter)
    }
    return -2; // named parameter
  }

  return 0;
}

type RouteData = object;

export type RouteConfig<D, P extends object> = {
  pattern: string;
  matchFn: MatchFunction<P>;
  pathFn: PathFunction<P>;
  mapped: string;
  regex: RegExp;
  score: number;
  tokens?: Array<string | object>;
  data?: D;
  [prop: string]: any;
}

export type RouteMatch<D, P extends object> = {
  path: string;
  isMatch: boolean;
  route?: RouteConfig<D, P>;
  params?: P
}

type RankedRoutes = RouteConfig<any, any>[]
type RouteMap = Map<string, RouteConfig<any, any>>;

class PathMatcher {
  location = '';
  routes: RouteMap = new Map();
  ranked: RankedRoutes = [];

  get config(): RouteConfig<any, any>[] {
    return this.ranked;
  }

  setLocation(path: string) {
    this.location = path;
  }

  addRoute<D = object, P extends object = object>(pattern: string, data?: D): RouteConfig<D, P> {
    if (this.routes.has(pattern)) {
      return this.routes.get(pattern);
    }

    try {
      let mapped = mapPattern(pattern);
      let regex = pathToRegexp(mapped);
      let matchFn = match<P>(mapped);
      let pathFn = compile<P>(mapped);
      let tokens = parse(mapped);
      let score = tokens.map(scoreToken).reduce(sumFn, 0);

      let route = { pattern, mapped, regex, matchFn, pathFn, score, data };

      this.routes.set(pattern, route);
      this.ranked = [ ...this.ranked, route ].sort(sortByScore);

      return route;
    } catch (e) {
      throw new Error(`${e.message} (${pattern})`);
    }
  }

  hasRoute(pattern: string): boolean {
    return this.routes.has(pattern);
  }

  assertRoute(pattern: string) {
    if (!this.hasRoute(pattern)) {
      throw new Error(`Unregistered route ${pattern}`);
    }
  }

  pathIs(pattern: string): boolean {
    this.assertRoute(pattern);
    return !!this.routes.get(pattern).matchFn(this.location);
  }

  pathIsNot(pattern: string): boolean {
    this.assertRoute(pattern);
    return !this.routes.get(pattern).matchFn(this.location);
  }

  pathMatches(pattern: string, path: string): boolean {
    let route = this.routes.get(pattern);
    return route.regex.test(path);
  }

  exec<D, P extends object>(pattern: string, path = this.location): RouteMatch<D, P> {
    let route = this.routes.get(pattern);

    if (route) {
      let isMatch = route.regex.test(path);
      let result = route.matchFn(path);
      return result ? {
        path, isMatch, route, params: { ...result.params }
      } : {
        path, isMatch, route
      };
    }

    return { path, isMatch: false };
  }

  bestMatch(path = this.location): RouteMatch<any, any> {
    let route = this.ranked
      .find(route => route.matchFn(path))

    if (route) {
      let result = route.matchFn(path);
      return result ? {
        path, isMatch: true, route, params: { ...result.params }
      } : {
        path, isMatch: false, route
      };
    }

    return null;
  }

  allMatches(path = this.location): RouteMatch<any, any>[] {
    return this.ranked
      .filter(route => route.regex.test(path))
      .map(route => {
        let match = route.matchFn(path);
        return match ? {
          path, isMatch: true, route, params: { ...match.params }
        } : {
          path, isMatch: true, route, params: {}
        }
      });
  }

  /**
   * TODO does the pattern need to be supplied here?
   * @deprecated
   */
  paramMatches(pattern: string, pName: string, pValue: string): boolean {
    this.assertRoute(pattern);
    if (this.pathIs(pattern)) {
      let match = this.routes.get(pattern).matchFn(this.location);
      if (match &&
        Object.hasOwn(match.params, pName) &&
        Object.is(match.params[pName], pValue)) {
        return true;
      }
    }
    return false;
  }

  exact(pattern: string): boolean {
    return true
  }
}

export default PathMatcher;

export const _test = {
  mapLookaheads, mapWildcards, chain, regex_path_separator
}