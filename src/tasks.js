import amend_attrs  from './tasks/amend-attrs.js';
import change_case from './tasks/change-case.js';
import remove_elements from './tasks/remove-elements.js';
import convert_blockquotes from './tasks/convert-blockquotes.js'
import map_elements from './tasks/map-elements.js';


const tasks = {
  ['amend-attrs']: amend_attrs,
  ['remove-elements']: remove_elements,
  ['change-case']: change_case,
  ['map-elements']: map_elements,
  ['todo']: convert_blockquotes,
}

const getTask = (task_name) => {
  if (!tasks[task_name]) {
    throw new Error(`Invalid task: ${task_name}`);
  }

  return tasks[task_name];
}

export default getTask;


/**
 * TODOs
 *
 * - Remove empty links, eg <a id="pg_135"></a>
 * - Remove calibre classes, eg <em class="calibre1">my</em>
 */