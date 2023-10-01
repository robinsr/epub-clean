import { inspect } from 'node:util';
import * as R from 'remeda';

const json_options = {
  colors: true, depth: 12
}

export const json = (obj: any): string => {
  let doInspect = R.anyPass(obj, [R.isObject, R.isArray, R.isDate, R.isFunction])
  if (doInspect) {
    return inspect(obj, json_options);
  }
  return obj;
}

/**
 * Adds inward facing arrows around text/object
 */
export const point = (str: any, emphasis = 1): string => {
  /* → */
  let right_arrow = '\u2B95 '.repeat(emphasis);
  /* ← */
  let left_arrow = ' \u2B05'.repeat(emphasis);
  //return `\u2B95 ${str} \u2B05`;
  return [ right_arrow, ' ', str, left_arrow ].join('');
}


