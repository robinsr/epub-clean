import result from './task-result.js';
import {CommonTaskArgs, GroupElementsArgs, TransformTaskType} from './tasks.js';
import {validators, taskSchema, validateSchema} from "./task-config.js";

import {parseElementMap, mapNode} from "../dom/element-map.js";
import {ParsedElementMap, parseSelector} from "../dom/index.js";
import {info} from "../log.js";
import { parseSelectorV2 } from '../dom/selector.js';

const task_name = 'group-elements';

const argsSchema = {
  wrapper: validators.selector().withTag(),
  map: validators.elementMap().default({ '*': '*' })
}

const validate = (args: GroupElementsArgs) => {
  return validateSchema(taskSchema.append(argsSchema), args, task_name);
}


const createWrapperEl = (selector: string, content: string) => {
  let wrapper = parseSelectorV2(selector);
  let t = wrapper.tag;
  let c = wrapper.classList.join(' ');
  let cls = c.length ? ` class="${c}"` : "";

  return `<${t}${cls}>\n${content}\n</${t}>`;
}

interface GroupElemConfig {
  map: ParsedElementMap,
  mapKeys: string[];
  extraELSelect: string;
}

const GroupElements: TransformTaskType<GroupElementsArgs> = {
  type: 'group-elements',
  configure: (args: GroupElementsArgs) => ({
    name: args.name,
    selector: args.selector,
    validate,
    parse: (args) => {

      let addElems = Object.keys(args.map).filter(key => {
        return key !== args.selector;
      }).join(', ');

      return args;
    },
    transform: (config, node, dom) => {

      let r = result();

      if (!dom.contains(node)) {
        info('node no longer exists. bailing');
        return r.final();
      }

      let wrapper = parseSelector(config.selector);
      let elemMap = parseElementMap(config.map);
      let mapKeys = Object.keys(elemMap);

      let siblings = [ node ];
      let next = node.next();
      while (next.isPresent() && next.get().matches(args.selector)) {
        siblings.push(next.get());
        next = next.get().next();
      }

      let addElems = Object.keys(config.map).filter(key => {
        return key !== args.selector;
      }).join(', ');

      info(`addElems: [${addElems}] and not [${args.selector}]`);

      while (next.isPresent()
        && next.get().matches(addElems)
        && !next.get().matches(args.selector)) {
        siblings.push(next.get());
        next = next.get().next();
      }

      let mappedEls = siblings.map(sib => {
        let matchKey = mapKeys.find(key => sib.matches(key));
        if (matchKey) {
          return mapNode(sib, elemMap[matchKey].from, elemMap[matchKey].to);
        } else {
          return sib.outer;
        }
      }).join('\n');

      siblings.slice(1).forEach(s => r.remove(s));

      let newNode = dom.newNode(createWrapperEl(args.wrapper, mappedEls));

      return r.replace(node, newNode).final();
    }
  })
}

export default GroupElements;