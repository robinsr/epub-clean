import { isString, isBoolean, isNonNull, isEmpty } from "remeda";
import { isValidSelector } from '../dom/index.js';
import { info, warn } from "../log.js";


type ParameterReqs<T> = {
  type: string;
  ident: (value: any) => boolean;
  required: boolean;
  match?: RegExp;
  enum?: Array<T>;
  use?: (value: T) => boolean;
}

type ParameterReqsFunc<T> = (...args: any[]) => ParameterReqs<T>

interface StringValidators {
  any: ParameterReqs<string>;
  match: ParameterReqsFunc<string>;
  enum: ParameterReqsFunc<string>;
  selector: ParameterReqs<string>;
}

interface BoolValidators {
  any: ParameterReqs<boolean>
}

type Schema = {
  //[key: string]: Schema | Schema[] | ParameterReqs<any>; //TODO, make nestable
  [key: string]: ParameterReqs<any>;
}


const getBoolValidators = (required: boolean = true): BoolValidators => {
  const common = { type: 'boolean', ident: isBoolean, required };
  return {
    any: { ...common }
  }
}

const getStringValidators = (required: boolean = true): StringValidators => {
  const common = { type: 'string', ident: isString, required };
  return {
    any: { ...common },
    match: (match: string = '.*') => ({
      ...common, match: new RegExp(match)
    }),
    enum: (...values: Array<string>) => ({
      ...common, enum: values
    }),
    selector: {
      ...common, use: isValidSelector
    }
  }
}

export const validators = {
  bool: getBoolValidators,
  string: getStringValidators
}

const validateParameter = (reqs: ParameterReqs<any>, path: string, val: any): string => {
  let { type, required, ident } = reqs;

  info(reqs, path, val);

  if (isEmpty(val)) {
    return required ? `Missing required parameter "${path}"` : null;
  }

  if (!ident(val)) {
    return `"${path}" is not of type "${type}"`;
  }

  if (reqs.enum) {
    return reqs.enum.includes(val) ? null : `"${path}" is not an allowed value`;
  }

  else if (reqs.match) {
    return reqs.match.test(val) ? null : `"${path}" does not match pattern "${reqs.match.source}"`;
  }

  else if (reqs.use) {
    return reqs.use(val) ? null : `"${path}" is invalid`;
  }

  return null;
}


export const validateSchema = (schema: Schema, args: object, label: string = "Unknown"): boolean => {
  info(typeof schema, schema, args);
  
  let schemamap = new Map(Object.entries(schema));

  let errors = Object.entries(args).map(([key, val]) => {
    if (schemamap.has(key)) {
      info(`Validating param "${key}" of value "${val}"`);
      info ('Using schema:', schemamap.get(key));
      return validateParameter(schemamap.get(key), key, val);
    } else {
      return null;
    }
  })
  .filter(isNonNull)


  if (errors) {
    warn(`Validation errors (${label}):`);
    errors.forEach(err => warn(`\t → ${err}`));
    //throw new Error('Stopping on validation error')
    return true;
  } else {
    return false;
  }
}

export const taskSchema = {
  name: validators.string().any,
  selector: validators.string().selector,
  task: validators.string().enum(
    'amend-attrs', 'change-case', 'group-elements', 
    'map-elements','remove-elements'
  )
}
