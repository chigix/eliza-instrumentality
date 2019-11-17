import { Decomp } from './decompo';
import { Key } from './key';
import { KeyStack } from './key-stack';

export function printKeyStack(keyStack: KeyStack) {
  console.log(keyStack);
}

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
  // const log = 'key: ' + key.getKey() + ' ' + key.getRank();
}

/**
 * Print the key and rank only, not the rest.
 *
 * Corresponding to `Key.printKey(int indent)`
 */
export function printKeySimple(indent: number) {
  //
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
