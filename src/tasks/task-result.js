const TaskResult = () => {
  let _remove = [];
  let _replace = [];
  let _html = null;
  let _error = null;
 
  return {
    remove(node) {
      _remove.push(node);
      return this;
    },

    replace(oldNode, newNode) {
      _replace.push([oldNode, newNode]);
      return this;
    },

    html(html) {
      _html = html;
      return this;
    },

    error(err) {
      _error = err;
      return this;
    },

    get noChange() {
      return empty(_remove) && empty(_replace) && 
      empty(_html) && empty(_error);
    },

    final() {
      return {
        noChange: this.noChange,
        remove: _remove,
        replace: _replace,
        html: _html,
        error: _error
      }
    }
  }
}

const empty = arr => {
  if (arr === null) return true;
  if (typeof arr === 'string' && arr === '') return true
  if (Array.isArray(arr) && arr.length === 0) return true;
  return false;
}

const result = (opts = {}) => {
  return TaskResult();
}

export default result;
