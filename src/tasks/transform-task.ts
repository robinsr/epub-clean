import { DomAdapter } from "../dom/adapter/adapter.js";
import { AccessNode } from "../dom/adapter/node.js";
import { CSSSelectorString } from "../dom/selector.js";


export interface TransformTask<Args, Config> {
  name: string;
  selector: CSSSelectorString;
  validate(args: Args): boolean,
  parse(args: Args): Config;
  filter?: (node: AccessNode) => boolean;
  transform: TransformFunction<Config>;
}

export interface TransformFunction<Config> {
  (config: Config, node: AccessNode, dom: DomAdapter): TransformTaskResult;
}

export interface TransformTaskArgs {
  name: string;
  selector: CSSSelectorString;
}

type RemoveResult = AccessNode;
type ReplaceResult = [AccessNode, AccessNode];
type InnerHTMLResult = string;

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