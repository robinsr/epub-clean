

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


