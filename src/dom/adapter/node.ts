import { TagNode } from "../tag.js";


export const NODE_TYPES = {
  1: 'ELEMENT',
  2: 'ATTRIBUTE',
  3: 'TEXT',
  4: 'CDATA_SECTION',
  7: 'PROCESSING_INSTRUCTION',
  8: 'COMMENT',
  9: 'DOCUMENT',
  10: 'DOCUMENT_TYPE',
  11: 'DOCUMENT_FRAGMENT',
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
  getAttr(attribute: string): string;
  setAttr(attribute: string, value: string): void;
  removeAttr(attribute): void;
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