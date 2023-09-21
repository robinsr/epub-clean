import { NODE_TYPES } from './adapter/node.js';

export type CSSSelectorString = string;
export type CSSClassName = string;
export type CSSNamespace = string;
export type TagName = string;

export interface ParsedSelectorString {
  selector: string;
  tag: TagName;
  classList: Array<CSSClassName>;
  namespaces: Array<CSSNamespace>;
  preserveAll: boolean;
  preserveOther: boolean;
}

export interface TagNode {
  get selectors(): string[];
  get selector(): string;
  get tagSummary(): string;
}

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

export interface DomNode {
  get node(): HTMLElement;
  get id(): string;
  setId(str: string): void
  get location(): string;
  get isValid(): boolean;
  remove(): void;
  replace(other: AccessNode): void;
  clone(): AccessNode;
  get outer(): string;
  set outer(htmlStr: string);
  get inner(): string;
  set inner(htmlStr: string);
  get text(): string;
  set text(textStr: string);
  get tag(): string;
  get type(): typeof NODE_TYPES;
  get isElement(): boolean;
  get isText(): boolean;
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
}

export type AccessNode = DomNode & TagNode;
