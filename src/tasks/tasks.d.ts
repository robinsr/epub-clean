//import { SchemaDefinition } from "validate/index.js";
import { AccessNode, DomAdapter, CSSSelectorString } from "../dom/index.js";

export interface CommonTaskArgs {
  name: string;  // name of configured task ("do a thing with <span> tags")
  task: string;  // name of task type (amend-attrs, change-case, etc)
  selector: CSSSelectorString;
}

export interface AmendAttrOp {
  op: 'add' | 'remove' | 'replace' | 'regex';
  attr: string;
  value: string | number;
}

export interface AmendAttrArgs extends CommonTaskArgs {
  attrs: AmendAttrOp[];
}

export interface ChangeCaseArgs extends CommonTaskArgs {
  case: 'lower-case' | 'title-case' | 'upper-case';
}

interface ElementMap {
  [key: CSSSelectorString]: CSSSelectorString
}

export interface GroupElementsArgs extends CommonTaskArgs {
  wrapper: CSSSelectorString;
  map: ElementMap;
}

export interface MapElementsArgs extends CommonTaskArgs {
  map: ElementMap;
}

export interface MapElementsConfig extends CommonTaskArgs{
  mapKeys: Array<CSSSelectorString>
  map: {
    [key: CSSSelectorString]: {
      from: ParsedSelectorString;
      to: ParsedSelectorString;
    }
  }
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
  validate(args: A): boolean,
  parse(args: A): C;
  filter?: (node: AccessNode) => boolean;
  transform: TransformFunction<C>;
}

export interface TaskTarget {
  node: AccessNode;
  include: boolean;
}

export interface ParsedTask<C> extends TaskDefinition<any, C> {
  config: C;
  targets: Array<TaskTarget>
}

export interface TransformFunction<C> {
  (config: C, node: AccessNode, dom: DomAdapter): TransformTaskResult;
}

export type RemoveResult = AccessNode;
export type ReplaceResult = [AccessNode, AccessNode];
export type InnerHTMLResult = string;

export interface TransformTaskResult {
  noChange: boolean;
  error: string;
  remove: Array<RemoveResult>;
  replace: Array<ReplaceResult>;
  html: InnerHTMLResult;
}

export interface TransformTaskResultsBuilder {
  remove: (node: AccessNode) => TransformTaskResultsBuilder;
  replace: (oldNode: AccessNode, newNode: AccessNode) => TransformTaskResultsBuilder;
  html: (html: string) => TransformTaskResultsBuilder;
  final: () => TransformTaskResult
  error: (err: string) => TransformTaskResult;
}

export interface VoidDomFunction {
  (node: DomNode): void;
}
