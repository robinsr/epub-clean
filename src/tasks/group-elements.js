


const group_elements = config => {
  let { name, selector, args } = config;

  validate_task(config, [ 'string' ]);

  let keepContent = args[0] === KEEP;

  return {
    name,
    selector,
    transform: ($, node) => {
      if (keepContent) {
        return result().html(node.innerHTML).final();
      } else {
        return result().remove(node).final();
      }
    }
  }
}

export default group_elements;