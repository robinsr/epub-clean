

// shamelessly copy/pasted from
// https://www.30secondsofcode.org/js/s/get-nested-object-value/
export const objGet = (from: object, selector: string) => {
  return selector
    .replace(/\[([^\[\]]*)\]/g, '.$1.')
    .split('.')
    .filter(t => t !== '')
    .reduce((prev, cur) => prev && prev[cur], from)
}

export const objPick = (from: object, selectors: string[]) => {
  return [...selectors]
    .map(s => ([s, objGet(from, s)]))
    .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {})
};
