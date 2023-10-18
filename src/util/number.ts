export function isNumber(val: any): boolean {
  return !isNaN(Number.parseInt(val));
}

export const sumFn = (a, b) => a + b;
