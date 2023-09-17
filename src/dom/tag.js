const Tag = (node, location) => {
  return {
    /**
     * Returns a string array of the tag expression
     * of a given node, one per class attribute
     *
     * Example:
     * 
     * for a node created from the tag:
     *     <p class="h3 extra"></p>
     *
     * function will return [ 'p.h3', 'p.extra' ]
     * @unused
     */
    get selectors() {
      if (!node.classList.length) {
        return [ node.tag ];
      }

      return node.classList.map(cls => `${ node.tag }.${ cls }`);
    },

    /**
     * Returns a string of the tag expression of
     * a given node with the class attributes combined
     *
     * Example:
     * 
     * for a node created from the tag:
     *     <p class="h3 extra"></p>
     *
     * function will return 'p.h3.extra'
     */
    get selector() {
      if (!node.classList.length) {
        return node.tag;
      }

      return `${ node.tag }.${ node.classList.join('.') }`
    },

    /**
     * Returns a printable "summary" of a tag. Example:
     * 
     * 0024: <p.h3.extra(ELEMENT)>⇒[1], contents: Lorem ipsum...
     */
    get tagSummary() {
      let tag = `<#${node.id}${node.selector}(${node.type})>`;
      let child = node.childCount || 0;
      let content = truncate(node.text || 'EMPTY', 80);

      if (location) {
        return `${location}: ${tag}⇒[${child}], contents: ${content}`;
      }

      return `${tag}⇒[${child}], contents: ${content}`;
    }
  }
}


const truncate = (str, num) => {
  // If the length of str is less than or equal to num
  // just return str--don't truncate it.
  if (str.length <= num) {
    return str
  }
  // Return str truncated with '...' concatenated to the end of str.
  let truncated = str.slice(0, num) + '...';

  return truncated.replaceAll('\n', '\\n')
}


export default Tag;
