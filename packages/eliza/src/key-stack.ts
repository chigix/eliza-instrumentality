import { Key } from './key';
import { notEmpty } from './utils';

/**
 * Break the string `s` into words.
 * For each word, if `isKey` is true, then push the key into the stack.
 *
 * @export
 * @param {KeyStack} stack
 * @param {string} s
 *
 * Learned from `KeyList.buildKeyStack(KeyStack stack, String s)`
 *
 * Rank keeping algorithm from `KeyStack#pushKey` method has been merged
 * into this method as well.
 */
export function buildKeyStack(keys: Key[], tokens: string[]) {
  const keyList = tokens.map(token => token.trim())
    .filter(token => token && token.length > 0)
    .map(token => keys.find(k => k.getKey() === token))
    .filter(notEmpty);
  return sortKeysByRank(keyList);
}

/**
 * Keep the highest rank keys at the bottom.
 *
 * Learned from `KeyStack#pushKey(Key key)`
 *
 * @param keyList
 */
function sortKeysByRank(keyList: Key[]) {
  return keyList.sort((a, b) => b.getRank() - a.getRank());
}
