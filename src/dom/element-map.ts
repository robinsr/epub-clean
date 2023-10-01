import logger from '../util/log.js';
import {AccessNode, ElementMap, ParsedElementMap, SelectorComponents} from "./dom.js";
import {parseSelector, removeNamespaces, sortSelectors} from "./selector.js";

const log = logger.getLogger(import.meta.url);

export const parseElementMap = (args: ElementMap): ParsedElementMap => {
  let mapKeys = sortSelectors(Object.keys(args).map(removeNamespaces));

  return mapKeys.reduce((accumulator, key) => ({
      ...accumulator, [key]: {
          from: parseSelector(key),
          to: parseSelector(args[key])
        }
      }), {});
}

export const mapNode = (
  node: AccessNode,
  matchProps: SelectorComponents,
  newProps: SelectorComponents): string => {

  let newTag = newProps.tag;
  let matchingCls = matchProps.classList;
  let oldClss = node.classList;
  let newClss = newProps.classList;
  let content = node.inner;

  // preserve all
  if (newProps.preserveAll) {
    newClss = [ ...oldClss, ...newClss ];
  }

  // preserve other
  if (newProps.preserveOther) {
    oldClss = oldClss.filter(cls => !matchingCls.includes(cls));
    newClss = [ ...oldClss, ...newClss ];
  }

  let attrs = Object.entries(node.attrs)
    .filter(([k, v]) => k !== 'class')
    .reduce((acc, [k,v]) => acc + ` ${k}="${v}"`, '');

  let classString = newClss.length ? ` class="${newClss.join(' ')}"` : "";

  let domString = `<${newTag}${classString}${attrs}>${content}</${newTag}>`;

  log.debug('Creating new DOM element with string:', domString);

  return domString;
}