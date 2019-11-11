import * as estring from './estring';
import { Key } from './key';

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
export function buildKeyStack(keys: Key[], s: string) {
  const keyList = [] as Key[];
  let guess = estring.trim(s);
  do {
    const lines = estring.match(guess, '* *');
    if (!lines) {
      break;
    }
    const matchedKey = keys.find(k => k.getKey() === lines[0]);
    if (matchedKey) { keyList.push(matchedKey); }
    guess = lines[1];
  } while (true);
  const finalMatch = keys.find(k => k.getKey() === guess);
  if (finalMatch) { keyList.push(finalMatch); }
  return new KeyStack(sortKeysByRank(keyList));
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

export class KeyStack {

  private keyStack: Key[] = [];

  constructor($keyStack: Key[]) {
    this.keyStack = $keyStack;
  }

  /**
   * Get the stack size.
   */
  public getKeyTop() {
    return this.keyStack.length;
  }

  /**
   * get a key from the stack
   */
  public getKey(n: number) {
    return this.keyStack[n] || null;
  }

}
