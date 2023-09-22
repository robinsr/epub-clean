import { isValidSelector } from '../dom/index.js';
import { debug, info, warn } from "../log.js";

import Joi, { ObjectSchema } from 'joi';

const custom = Joi.extend((joi) => {
  return {
    type: 'selector',
    base: joi.string(),
    messages: {
      'selector.invalid': '"{{#label}}" is an invalid CSS selector'
    },
    validate(value, helpers) {
      if (!isValidSelector(value)){
        return { value, errors: helpers.error('selector.invalid') }
      }
      return null;
    }
  }
});

export const taskSchema = Joi.object({
  name: Joi.string().required(),
  selector: custom.selector(),
  task: Joi.string().allow(
    'amend-attrs', 'change-case', 'group-elements', 
    'map-elements','remove-elements'
  )
});


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
  oneOf: (...values) => Joi.any().allow(...values).required(),
  selector: () => custom.selector().required(),
  object: (...args: any[]) => Joi.object(...args),
  array: () => Joi.array()
}


export const validateSchema = (schema: ObjectSchema, args: object, label: string = "Unknown"): boolean => {
  
  info(schema.describe());
  debug(JSON.stringify(schema.describe(), null, 4));
  info(args);

  let { error } = schema.validate(args);


  if (error) {
    warn(`Validation errors (${label}):`);
    warn(error);
    //throw new Error('Stopping on validation error')
    return true;
  } else {
    return false;
  }
}

