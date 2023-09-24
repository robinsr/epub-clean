import { ValidationResult } from "./tasks.js";
import { isValidSelector } from '../dom/index.js';
import { debug, info, warn } from "../log.js";

import Joi, { ObjectSchema } from 'joi';

const JOI_OPTS = {
  abortEarly: false,
  wrap: { label: false }
}

const selectorMsgs = {
  from: `Invalid CSS selector in mapping: [\u2B95 {#key} \u2B05 : {#value} ]`,
  to: 'Invalid CSS selector in mapping: [ {#key} : \u2B95 {#value} \u2B05 ]'
};

const customJoi = Joi.extend((joi) => {
  return {
    type: 'selector',
    base: joi.string(),
    messages: {
      //'selector.invalid': '({$forTask}) param {#label} {:#value} is not a valid CSS selector'
      //'selector.invalid': 'param {#label} {:#value} is not a valid CSS selector'
    },
    validate(value, helpers) {
      if (!isValidSelector(value)){
        return { value, errors: helpers.error('selector.invalid') }
      }

      return null;
    }
  }
});

const elementMap = () => Joi.object({})
        .pattern(
          customJoi.selector(),
          customJoi.selector())
        // default object.unknown message is -> "XYZ" is not allowed;
        .messages({
          'object.unknown': selectorMsgs.from,
          'selector.invalid': selectorMsgs.to
        })

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
  selector: () => customJoi.selector().required(),
  elementMap: elementMap,
  object: (...args: any[]) => Joi.object(...args),
  array: () => Joi.array()
}

export const taskSchema = Joi.object({
  name: Joi.string().required().label('Task Name').note('this is special', 'this is important'),
  selector: customJoi.selector(),
  task: Joi.any().valid(
    'amend-attrs', 'change-case', 'group-elements',
    'map-elements','remove-elements'
  ).required()
});

export const validateSchema = (
  schema: ObjectSchema,
  args: object,
  label: string = "Unknown"
): ValidationResult | null => {
  debug(JSON.stringify(schema.describe(), null, 4));

  let opts = {
  //  context: { forTask: label }
  };

  let { error } = schema.validate(args, { ...JOI_OPTS, ...opts });

  if (!error) {
    return null;
  }

  warn(`Validation errors (${label}):`);

  let addLabel = str => `(${label}) ${str};`

  return error.details
    .map(err =>  ({ ...err, message: addLabel(err.message) }))
    .reduce((acc, { message, type: problem, context }) => {
      //console.log(message, problem, context)
      let { key, value } = context;
      return { ...acc, [key]: { problem, value, message } }
  }, {});
}

