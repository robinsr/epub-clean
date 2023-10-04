import { isNumber} from './number.js';

export const sortByGetter = <T> (fn: (t: T) => string) => {

  let sorter = (a: T, b: T, char = 0): number => {
    let aName = fn(a);
    let bName = fn(b);

    let x = aName.charAt(char);
    let y = bName.charAt(char);

    if (isNumber(x) && isNumber(y)) {
      let xNum = parseInt(aName.slice(char));
      let yNum = parseInt(bName.slice(char));

      if (xNum > yNum) return 1;
      if (xNum < yNum) return -1;
      return sorter(a, b, char + 1);
    }

    if (x > y) return 1;
    if (x < y) return -1;

    if (char + 1 <= aName.length || char + 1 <= bName.length) {
      return sorter(a, b, char + 1);
    }

    if (aName.length < bName.length) return -1;
    if (aName.length > bName.length) return 1;
    return 0;
  }

  return sorter;
}