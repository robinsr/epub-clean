import { tasklog } from '../log.js';
import { AccessNode } from '../dom/index.js';
import { validators, validateSchema, taskSchema } from './task-config.js'
import result from './task-result.js';
import { 
  AmendAttrArgs,
  AmendAttrOp,
  TaskDefinition,
  TransformTaskType
} from './tasks.js';

const TASK_NAME = 'amend-attrs';

const log = tasklog.getSubLogger({ name: TASK_NAME });

const { array, forbid, object, oneOf, req, string } = validators;


const attributeSchema = object({
  attr: string().req(),
  op: oneOf('add', 'remove', 'replace', 'regex'),
  value: string().opt()
    .when('op', [
      { is: 'add', then: req() },
      { is: 'replace', then: req() },
      { is: 'remove', then: forbid() },
      { is: 'regex', then: forbid() }
  ]),
  values: array().length(2).items(string().req().allow(''))
    .when('op', { is: 'regex', then: req(), otherwise: forbid() })
  })
  .rename('attribute', 'attr')

const schema = {
  attrs: array().items(attributeSchema)
};

const configure = (config): TaskDefinition<AmendAttrArgs> => ({
  name: config.name,
  selector: config.selector,
  validate: (args) => validateSchema(taskSchema.append(schema), args, TASK_NAME),
  parse: (args) => args,
  transform: (config, node) => {
    const applyUpdates = (node: AccessNode, args: AmendAttrOp) => {
      let { attr, op } = args;

      let value = new String(args.value).valueOf();

      let currentVal = node.getAttr(attr);

      if (op === 'add') {
        node.setAttr(attr, value);
      }

      if (op === 'regex') {
        if (!currentVal) {
          log.error(`Cannot update attribute ${attr} on ${node.tag}`);
          return node;
        }

        let re = new RegExp(value[0]);
        let replaceVal = currentVal.replace(re, value[1]);
        node.setAttr(attr, replaceVal);
      }

      if (op === 'replace' && node.hasAttr(attr)) {
        node.setAttr(attr, value);
      }

      if (op === 'remove') {
        node.removeAttr(attr);
      }

      if (node.getAttr(attr) === '') {
        node.removeAttr(attr);
      }

      return node;
    }

    if (node.tag !== 'body') {
      let newNode = config.attrs.reduce(applyUpdates, node.clone());
      return result().replace(node, newNode).final();
    } else {
      // Replacing the body element with a clone has major consequences
      config.attrs.reduce(applyUpdates, node);
      return result().final();
    }
  }
});

const AmendAttrs: TransformTaskType<AmendAttrArgs> = {
  type: TASK_NAME,
  configure
}

export default AmendAttrs;


//let attrs = node.getAttributeNames()
//console.log(attrs);
// Array.from(attrs).forEach(attr => {
//   console.log(attr, node.getAttribute(attr));
// });
//       // TODO, data attributes. Not super important
// 
// const getAttribute = (n, attr) => {
//   if (attr.startsWith('data-')) {
//     return n.dataset[attr.replace('data-','')]
//   } else {
//     return n.getAttribute(attr);
//   }
// }