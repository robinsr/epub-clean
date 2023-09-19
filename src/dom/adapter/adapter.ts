import { CSSSelectorString } from "../selector.js";
import { AccessNode } from "./node.js";

export type HTMLFileContents = string;
export type HTMLBodyContents = string;
export type DomString = string;

export interface Adapter {
  getContents: () => HTMLFileContents;
}

export interface DomAdapter extends Adapter {
  get body(): HTMLBodyContents;
  query: (selector: CSSSelectorString) => AccessNode[];
  get: (id: string) => AccessNode;
  contains: (node: AccessNode) => boolean;
  newNode: (str: DomString) => AccessNode;
}