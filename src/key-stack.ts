import _ = require('lodash');
import * as estring from './estring';
import { Key } from './key';

const stackSize = 20;

/**
 * Break the string `s` into words.
 * For each word, if `isKey` is true, then push the key into the stack.
 *
 * @export
 * @param {KeyStack} stack
 * @param {string} s
 *
 * Learned from `KeyList.buildKeyStack(KeyStack stack, String s)`
 */
export function buildKeyStack(keys: Key[], stack: KeyStack, s: string) {
  stack.reset();
  let guess = estring.trim(s);
  do {
    const lines = estring.match(guess, '* *');
    if (!lines) {
      break;
    }
    const matchedKey = keys.find(k => k.getKey() === lines[0]);
    if (matchedKey) { stack.pushKey(matchedKey); }
    guess = lines[1];
  } while (true);
  const finalMatch = keys.find(k => k.getKey() === guess);
  if (finalMatch) { stack.pushKey(finalMatch); }
}

export class KeyStack {

  private keyStack: Key[] = [];

  /* The to pof the key stack */
  private keyTop = 0;

  /**
   * Get the stack size.
   */
  public getKeyTop() {
    return this.keyTop;
  }

  /**
   * Reset the key stack
   */
  public reset() {
    this.keyTop = 0;
  }

  /**
   * get a key from the stack
   */
  public getKey(n: number) {
    return this.keyStack[n] || null;
  }

  /**
   * Push a key into the stack.
   * Keep the highest rank keys at the bottom.
   */
  public pushKey(key: Key) {
    if (_.isNull(key)) {
      console.log('push null key');

      return;
    }
    let i = 0;
    for (; i > 0; i--) {
      if (key.getRank() > this.keyStack[i - 1].getRank()) {
        this.keyStack[i] = this.keyStack[i - 1];
      } else { break; }
    }
    this.keyStack[i] = key;
    this.keyTop++;
  }
}
