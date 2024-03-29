import { NODE_TYPES } from './adapter/node.js';
import { Optional } from "typescript-optional";


export interface SelectorComponents {
  selector: string;
  tag: string;
  classList: string[];
  namespaces: string[];
  preserveAll: boolean;
  preserveOther: boolean;
}

export interface ElementMap {
  [key: string]: string
}

export interface ParsedElementMap {
  [key: string]: {
    from: SelectorComponents;
    to: SelectorComponents;
  }
}

export interface TagNode {
  get selectors(): string[];
  get selector(): string;
  get tagSummary(): string;
}

export interface Adapter {
  getContents(): string;
  saveContents(c: string): void;
  diffWith(u: string): void;
  get target(): string;
}

export interface DomAdapter {
  get body(): string;
  query: (selector: string) => AccessNode[];
  first: (selector: string) => AccessNode;
  get: (id: string) => AccessNode;
  contains(node: AccessNode): boolean;
  newNode: (str: string) => AccessNode;
  clean(): void;
}

export interface NodeLocation {
  startCol: number;
  startLine: number;
}

export type NodeFormatOptions = 'full' | 'diff';

export interface DomNode {
  get node(): HTMLElement;
  get id(): string;
  setId(str: string): void
  get location(): NodeLocation;
  get isValid(): boolean;
  remove(): void;
  replace(other: AccessNode): void;
  clone(): AccessNode;
  get outer(): string;
  get domString(): string;
  set outer(htmlStr: string);
  get inner(): string;
  set inner(htmlStr: string);
  get text(): string;
  set text(textStr: string);
  get tag(): string;
  get type(): typeof NODE_TYPES;
  get isElement(): boolean;
  get isText(): boolean;
  get attrs(): any;
  hasAttr(attribute: string): boolean;
  getAttr(attribute: string): string;
  setAttr(attribute: string, value: string): void;
  removeAttr(attribute: string): void;
  get classList(): string[];
  hasClass(className: string): boolean;
  addClass(className: string): void;
  removeClass(cls: string): void;
  matches(selector: string): boolean;
  get children(): AccessNode[];
  get hasChildren(): boolean;
  get childCount(): number;
  contains(node: AccessNode): boolean;
  isSameNode(node: AccessNode): boolean;
  get parent(): AccessNode;
  find(selector: string): AccessNode[];
  next(): Optional<AccessNode>;
}

export type AccessNode = DomNode & TagNode;
