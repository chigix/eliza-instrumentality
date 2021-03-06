import * as estring from './estring';
import { PrePost } from './interfaces';

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
  // The space control is too Tricky !!
  // TODO: https://github.com/chigix/eliza-instrumentality/issues/3
  // could solve this problem.
  let work = ' ' + estring.trim(s) + ' ';
  let lines = [] as string[];
  const toReplace = prePosts.find(search => {
    const searchResult = estring.match(work, `*${search.src}*`);
    if (!searchResult) {
      return false;
    }
    lines = searchResult;
    return true;
  });
  if (toReplace) {
    work = translate(prePosts, lines[0])
      + toReplace.dest.trim() + translate(prePosts, lines[1]);
  }
  let forExtract = estring.match(work, ' * ');
  if (forExtract) { return forExtract[0]; }
  forExtract = estring.match(work, '  ');
  if (forExtract) { return ''; }
  return work;
}
