import flattenDepth from 'lodash/flattenDepth';

export function cartesian(a: any[], b: any[]) {
  const oneProd = a.map(d => b.map(e => [d, e]));
  return flattenDepth(oneProd, 1);
}
