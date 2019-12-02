import { Decomp } from './decompo';
import { Key } from './key';

/**
 * Print the key and all under it.
 *
 * Corresponding to `Key.print(int indent)`
 */
export function snapshotKey(key: Key) {
  const toPrint: {
    key?: any,
    rank?: any,
    decomps?: any,
  } = {};
  toPrint.key = key.getKey();
  toPrint.rank = key.getRank();
  toPrint.decomps = (key.getDecomp() || []).map(d => snapshotDecomp(d));
  return toPrint;
}

/**
 * Print out the decomp rule.
 *
 * @export
 * @param {Decomp} d
 * @param {number} indent
 *
 * Learned from `Decomp.print(int indent)`
 */
export function snapshotDecomp(d: Decomp) {
  return {
    pattern: d.getPattern(),
    isAware: d.isMemoryKey(),
    reasembs: d.getReasemb(),
  };
}
