import flattenDepth from 'lodash/flattenDepth';
import { ReassembleContext } from './interfaces';

export function cartesian(a: any[], b: any[]) {
  const oneProd = a.map(d => b.map(e => [d, e]));
  return flattenDepth(oneProd, 1);
}

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export function getAssembledReply(ctx: ReassembleContext | null): string | null;
export function getAssembledReply(ctx: ReassembleContext | null, defaultMsg: string): string;
export function getAssembledReply(ctx: ReassembleContext | null, defaultMsg?: string): string | null {
  if (ctx && ctx.assembled && ctx.assembled.reassembled) {
    return ctx.assembled.reassembled;
  }
  return defaultMsg || null;
}

export function getAssembledContext(ctx?: ReassembleContext | null) {
  if (ctx && ctx.assembled) {
    return ctx.assembled;
  }
  return null;
}
