

export function isNumber(val: any): boolean {
  return !isNaN(Number.parseInt(val));
}

[ 1, '1', 'cars', [ 'im', 'a', 'compost' ], { name: 'compost' } ].forEach(i => {
  console.log(i, isNumber(i));
})