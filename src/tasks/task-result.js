
class TaskResult {
  constructor(target) {
    this.target = target;
    this._remove = [];
    this._replace = [];
    this._html = null;
    this._error = null;
  }

  remove(node) {
    this._remove.push(node);
    return this;
  }

  replace(oldNode, newNode) {
    this._replace.push([oldNode, newNode]);
    return this;
  }

  html(html) {
    this._html = html;
    return this;
  }

  error(err) {
    this._error = err;
    return this;
  }

  final() {
    return {
      remove: this._remove,
      replace: this._replace,
      html: this._html
    }
  }
}

const result = (opts = {}) => {
  return new TaskResult();
}

export default result;
