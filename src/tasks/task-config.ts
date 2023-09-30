import Joi, { ObjectSchema, ArraySchema } from 'joi';

import logger from '../log.js';

import { ValidationResult } from "./tasks.js";
import { isValidSelector, parseSelector } from '../dom/index.js';
import { parseSelectorV2 } from '../dom/selector.js';

const log = logger.getLogger(import.meta.url);
log.addContext('task', 'task-config');

const JOI_OPTS = {
  abortEarly: false,
  wrap: { label: false }
}

const point = str =>  `\u2B95 ${str} \u2B05`;

const selectorMsgs = {
  'object.unknown': `Invalid CSS selector in mapping: [ ${point('{#key}')} : {#value} ]`,
  'selector.invalid': `Invalid CSS selector in mapping: [ {#key} : ${point('{#value}')} ]`,
  'selector.needsTag': '{#label} {:#value} requires type selector',
  'selector.sibling': '{#label} {:#value} is a sibling selector. Good Job!'
};

const selector_type = (joi): Joi.Extension => ({
  type: 'selector',
  base: Joi.string(),
  messages: Object.assign({}, selectorMsgs, {
    'selector.invalid': '{#label} {:#value} is not a valid CSS selector'
  }),
  validate(value, helpers) {
    if (helpers.schema.$_getFlag('allow-siblings')) {
      let p = parseSelectorV2(value);
      log.debug('parsed selector:', p);
      return { value, errors: helpers.error('selector.sibling') }
    }

    if (helpers.schema.$_getFlag('tag-required')) {
      let p = parseSelectorV2(value);
      if (!p.tag) return { value, errors: helpers.error('selector.needsTag') };
    }

    if (!isValidSelector(value)){
      return { value, errors: helpers.error('selector.invalid') }
    }

    return null;
  },
  rules: {
    withTag: {
      alias: 'withElement',
      method() {
        return this.$_setFlag('tag-required', true);
      }
    },
    simple: {
      alias: 'noComplex',
      method() {
        return this.$_setFlag('only-simple', true);
      }
    },
    adjacentOk: {
      alias: 'siblings',
      method() {
        return this.$_setFlag('allow-siblings', true);
      }
    },
  }
});

// TODO Maybe
const sibling_selector: Joi.Extension = {
  type: 'adjSibling',
}

const custom_validators = Joi.extend(selector_type);

const elementMap = () => Joi.object({})
        .pattern(
          custom_validators.selector(),
          custom_validators.selector())
        // default object.unknown message is -> "XYZ" is not allowed;
        .messages(selectorMsgs);

export const validators = {
  any: () => Joi.any(),
  req: () => Joi.required(),
  forbid: () => Joi.any().forbidden(),
  bool: () => ({
    any: () => Joi.boolean().required()
  }),
  string: () => ({
    any: () => Joi.string().required(),
    req: () => Joi.string().required(),
    opt: () => Joi.string(),
    arr: (l: number) => Joi.array().length(l)
  }),
  oneOf: (...values) => Joi.any().valid(...values).required(),
  selector: () => custom_validators.selector().required(),
  elementMap: elementMap,
  object: (...args: any[]) => Joi.object(...args),
  array: () => Joi.array()
}

export const taskSchema = Joi.object({
  name: Joi.string().required(),
  selector: custom_validators.selector(),
  task: Joi.any().valid(
    'amend-attrs', 'change-case', 'group-elements',
    'map-elements','remove-elements'
  ).required()
});

export const validateSchema = (
  schema: ObjectSchema | ArraySchema,
  args: object,
  label: string = "Unknown"
): ValidationResult | null => {
  log.debug('Validating schema:', schema.describe());

  let opts = {
  //  context: { forTask: label }
  };

  let { error } = schema.validate(args, { ...JOI_OPTS, ...opts });

  if (!error) {
    return null;
  }

  log.warn('Validation errors for task:', label);

  let addLabel = str => `(${label}) ${str};`

  return error.details
    .map(err =>  ({ ...err, message: addLabel(err.message) }))
    .reduce((acc, { message, type: problem, context }) => {
      log.debug('Validation error:', message, problem, context);
      let { key, value } = context;
      return { ...acc, [key]: { problem, value, message } }
  }, {});
}

