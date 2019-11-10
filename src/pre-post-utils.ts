import * as estring from './estring';
import { PrePost } from './interfaces';

/**
 * Translate a string.
 * If str matches a src string on the list,
 * return the corresponding dest.
 * If no match, return the input.
 *
 * @param {string} str
 *
 * Learned from `PrePostList.xlate(String str)`
 */
function xlate(prePosts: PrePost[], str: string) {
  for (const prePost of prePosts) {
    if (str === prePost.src) {
      return prePost.dest;
    }
  }

  return str;
}

/**
 * Translate a string s.
 * 1. Trim spaces off
 * 2. Break s into words
 * 3. For each word, substitute matching src word with dest
 *
 * @export
 * @param {string} s
 * 
 * Learned from `PrePostList.translate(String s)`
 */
export function translate(prePosts: PrePost[], s: string) {
  let work = estring.trim(s);
  let result = '';
  do {
    const lines = estring.match(work, '* *');
    if (!lines) {
      break;
    }
    result += xlate(prePosts, lines[0]) + ' ';
    work = estring.trim(lines[1]);
  } while (true);
  result += xlate(prePosts, work);

  return result;
}
