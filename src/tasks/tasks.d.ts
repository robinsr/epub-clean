import {
  AccessNode,
  DomAdapter,
  CSSSelectorString,
  ElementMap,
  ParsedElementMap
} from "../dom/index.js";
import TaskResult from './task-result.js';


export interface CommonTaskArgs {
  name: string;  // name of configured task ("do a thing with <span> tags")
  task: string;  // name of task type (amend-attrs, change-case, etc)
  selector: CSSSelectorString;
}

export interface AmendAttrAddReplaceOp {
  op: 'add' | 'replace';
  attr: string;
  value: string | number;
}

export interface AmendAttrRegexOp {
  op: 'regex';
  attr: string;
  match: string;
  replace: string;
}

export interface AmendAttrRemoveOp {
  op: 'remove'
  attr: string;
}

export type AmendAttrOp = AmendAttrAddReplaceOp | AmendAttrRegexOp | AmendAttrRemoveOp;

export interface AmendAttrArgs extends CommonTaskArgs {
  attrs: AmendAttrOp[];
}

export interface ChangeCaseArgs extends CommonTaskArgs {
  case: 'lower-case' | 'title-case' | 'upper-case';
}

export interface GroupElementsArgs extends CommonTaskArgs {
  wrapper: CSSSelectorString;
  map: ElementMap;
}

export interface MapElementsArgs extends CommonTaskArgs {
  map: ElementMap;
}

export interface MapElementsConfig extends CommonTaskArgs {
  mapKeys: Array<CSSSelectorString>
  map: ParsedElementMap
}

export interface RemoveElementsArgs extends CommonTaskArgs {
  content?: boolean;
}

type TaskArgs = AmendAttrArgs | ChangeCaseArgs |
            GroupElementsArgs | MapElementsArgs |
            RemoveElementsArgs;

export type ConfigFile = Array<TaskArgs>;


export type TaskConfigurator<A, C = A> = (args: A) => TaskDefinition<A, C>;

export interface TransformTaskType<A extends CommonTaskArgs, C = A> {
  type: string;
  configure: TaskConfigurator<A, C>
}

export interface TaskDefinition<A, C = A> {
  name: string;
  selector: CSSSelectorString;
  validate(args: A): ValidationResult | null,
  parse(args: A): C;
  filter?: (node: AccessNode) => boolean;
  transform: TransformFunction<C>;
}

export interface TaskTarget {
  node: AccessNode;
  include: boolean;
}

interface ValidationResult {
  [key: string]: {
    problem: string;
    message: string;
    value: any;
  }
}

export interface ParsedTask<C> extends TaskDefinition<any, C> {
  config?: C;
  targets?: Array<TaskTarget>
  errors?: ValidationResult
}

export interface TransformFunction<C> {
  (config: C, node: AccessNode, dom: DomAdapter): TaskResult;
}

export interface VoidDomFunction {
  (node: DomNode): void;
}
