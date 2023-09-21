import { AccessNode } from "../dom/index.js";
import { VoidDomFunction } from "./tasks.js";

/**
 * Traverses a DOM tree, appling a callback
 * function to each end node 
 *
 * Useful for transforming text in elements
 * with formatting elements (<b>, <i>, etc)
 */
export const walkTree = (node: AccessNode, func: VoidDomFunction): void => {
  if (node.hasChildren) {
    node.children.forEach(n => walkTree(n, func));
  } else {
    func(node);
  }
}