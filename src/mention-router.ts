import * as EString from './estring';
import { MentionRoute } from './interfaces';
import { NoMentionDefException } from './exceptions';

/**
 * Decomposition match,
 * If decomp has no synonyms, do a regular match.
 * Otherwise, try all synonyms.
 *
 * @export
 * @param {MentionRoute[]} synonyms
 * @param {string} str
 * @param {string} pat
 * @returns
 *
 * Learned from `SynList.matchDecomp(String str, String pat, String[] pickMentionTag)`
 */
export function matchDecomposition(
  synonyms: MentionRoute[], str: string, pat: string): string[] | null {
  const pickMentionTag = EString.match(pat, '*@* *');
  if (!pickMentionTag) {
    // no tagged mention in decomposition pattern
    return EString.match(str, pat);
  }
  // isolate the mention tag
  const head = pickMentionTag[0];
  const mentionTag = pickMentionTag[1];
  const tail = ` ${pickMentionTag[2]}`;
  //  Look up the synonym
  const syn = synonyms.find(synonym => synonym.tag === mentionTag);
  if (!syn) {
    throw new NoMentionDefException(mentionTag);
  }
  let matchedParts: string[] | null = null;
  //  Try each synonym individually
  syn.words.concat(syn.words.concat(syn.tag)).find(word => {
    // Make a modified pattern
    matchedParts = EString.match(str, `${head}${word}${tail}`);
    if (!matchedParts) {
      return false;
    }
    const n = EString.count(head, '*');
    // Make room for the synonym in the match list.
    const newArr = [
      ...matchedParts.slice(0, n),
      // The synonym goes in the match list.
      word,
      ...matchedParts.slice(n),
    ];
    matchedParts = newArr;
    return true;
  });
  return matchedParts;
}
