import _ from 'lodash';

const NUMBERS = '0123456789';

/**
 * Look for a match between the string and the pattern.
 * Return matchingLength of matching characters before * and #.
 * Return -1 if strings do not match.
 *
 * e.g: `pre: dont don't` `*pre: * *` ==> 0
 * e.g: `pre: dont don't` `pre: * *` ==> 5
 *
 * @export
 * @param {string} str
 * @param {string} pat Pattern
 */
export function amatch(str: string, pat: string) {
  if (str.length < 1) {
    return -1;
  }
  let matchingLength = 0;
  let i = 0; // Move through string
  let j = 0; // Move through pattern
  while (i < str.length && j < pat.length) {
    const p = pat.charAt(j);
    // Stop if pattern is * or #
    if (p === '*' || p === '#') {
      return matchingLength;
    }
    if (str.charAt(i) !== p) {
      return -1;
    }
    // They are still equal
    i++; j++; matchingLength++;
  }

  return matchingLength;
}

/**
 * Search in successive positions of the string,
 * looking for a match to the pattern.
 * Return the start position in str of the match,
 * or -1 for no match.
 *
 * Learned from `EString#findPat(String str, String pat)`
 *
 * @export
 * @param {string} str
 * @param {string} pat
 * @returns
 */
export function findWildString(str: string, pat: string) {
  let matchingLength = 0;
  for (let i = 0; i < str.length; i++) {
    if (amatch(str.substring(i), pat) >= 0) {
      return matchingLength;
    }
    matchingLength++;
  }

  // End of the str reached
  return -1;
}

/**
 * Look for a number in the string.
 *
 * @export
 * @param {string} str
 * @returns the length of numerical digits from the beginning,
 * or `0` if the string does not start with number.
 */
export function findNum(str: string) {
  let matchingLength = 0;
  for (let i = 0; i < str.length; i++) {
    if (NUMBERS.indexOf(str.charAt(i)) === -1) {
      return matchingLength;
    }
    matchingLength++;
  }
  return matchingLength;
}

/**
 * Match the string against a pattern and fills in
 * matches array with the pieces that matched * and #
 *
 * This function is implemented as the original 1966 version algorithm.
 *
 * @export
 * @param {string} str
 * @param {string} pat       Script Interpretable Symbols.
 * @returns Accumulated Script Lines that have been matched
 */
function match_v1(str: string, pat: string): string[] | null {
  const matches: string[] = [];
  let i = 0; // Used to scan str
  let pos = 0; // used to scan the given pattern
  while (pos < pat.length && matches.length < Math.max(matches.length, 4)) {
    switch (pat.charAt(pos)) {
      case '*':
        const n1 = (pos + 1 === pat.length) ?
          (str.length - i) : findWildString(str.substring(i), pat.substring(pos + 1));
        if (n1 < 0) { return null; }
        matches.push(str.substring(i, i + n1));
        i += n1; pos++;
        break;
      case '#':
        const n2 = findNum(str.substring(i));
        matches.push(str.substring(i, i + n2));
        i += n2; pos++;
        break;
      default:
        const n3 = amatch(str.substring(i), pat.substring(pos));
        if (n3 <= 0) { return null; }
        i += n3; pos += n3;
        break;
    }
  }
  if (i >= str.length && pos >= pat.length) { return matches; }

  return [];
}

/**
 * This version is clearer than `match_v1`, but hopelessly slow
 *
 * @export
 * @param {string} strIn
 * @param {string} patIn
 * @param {string[]} matches
 * @returns
 */
function match_v2(strIn: string, patIn: string, matches: string[]) {
  return true;
}

/**
 * Check if the script line read match the given pattern
 *
 * @export
 * @param {string} str line
 * @param {string} pat Pattern
 * @returns Matched script lines stored here
 */
export function match(str: string, pat: string) {
  return match_v1(str, pat);
}

/**
 * Translates corresponding characters in src to dest.
 * Src and dest must have the same length.
 *
 * @export
 * @param {string} str
 * @param {string} src
 * @param {string} dest
 * @returns
 */
export function translate(str: string, src: string, dest: string) {
  if (src.length !== dest.length) {
    throw new Error('Impossible Error');
  }
  for (let index = 0; index < src.length; index++) {
    str = str.replace(src.charAt(index), dest.charAt(index));
  }

  return str;
}

/**
 * Compresses its input by:
 *   dropping space before space, comma, and period;
 *   adding space before question, if char before is not a space; and
 *   copying all others
 *
 * @export
 * @param {string} s
 * @returns
 */
export function compress(s: string) {
  let dest = '';
  if (s.length < 1) {
    return s;
  }
  let prevChar: string | undefined;
  s.split('').forEach(currChar => {
    if (!prevChar) {
      prevChar = currChar;

      return;
    }
    if (prevChar === ' ' &&
      ([' ', ',', '.'].indexOf(currChar) > -1)) {
      // nothing
    } else if (prevChar !== ' ' && currChar === '?') {
      dest += `${prevChar} `;
    } else {
      dest += prevChar;
    }
    prevChar = currChar;
  });

  return dest + (prevChar || '');
}

/**
 * Trim off leading spaces
 *
 * @export
 * @param {string} s
 */
export function trim(s: string) {
  return _.trimStart(s);
}

/**
 * Pad by ensuring there are spaces before and after the sentence.
 *
 * @export
 * @param {string} s
 * @returns
 */
export function pad(s: string) {
  return ` ${_.trim(s)} `;
}

/**
 * Count number of occurrances of c in str
 */
export function count(s: string, c: string) {
  return _.countBy(s)[c] || 0;
}
