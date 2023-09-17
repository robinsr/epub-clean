import amend_attrs  from './tasks/amend-attrs.js';
import change_case from './tasks/change-case.js';
import remove_elements from './tasks/remove-elements.js';
import map_elements from './tasks/map-elements.js';
import group_elements from './tasks/group-elements.js';

//import convert_blockquotes from './tasks/convert-blockquotes.js'


const tasks = {
  ['amend-attrs']: amend_attrs,
  ['remove-elements']: remove_elements,
  ['change-case']: change_case,
  ['map-elements']: map_elements,
  ['group-elements']: group_elements,
}

const getTask = (taskName) => {
  if (!tasks[taskName]) {
    throw new Error(`Invalid task: ${taskName}`);
  }

  return tasks[taskName];
}

export default getTask;


/**
 * TODOs
 *
 * - Remove empty links, eg <a id="pg_135"></a>
 * - Remove calibre classes, eg <em class="calibre1">my</em>
 */