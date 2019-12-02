import flattenDepth from 'lodash/flattenDepth';

export function cartesian(a: any[], b: any[]) {
  const oneProd = a.map(d => b.map(e => [d, e]));
  return flattenDepth(oneProd, 1);
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
