import * as EString from './estring';
import { MentionRoute, HyperDecomposition } from './interfaces';
import { NoMentionDefException } from './exceptions';
import { cartesian } from './utils';

const NAMING_CHARACTERS = ('ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  + 'abcdefghijklmnopqrstuvwxyz'
  + '0123456789-_').split('');

function validateMentionNaming(name: string) {
  return name.split('').find(c => NAMING_CHARACTERS.indexOf(c) < 0) === undefined;
}

function segmentScope(pattern: string) {
  const patternProfile: Array<{ pattern: string, mentions?: string[] }> = [];
  let restToSegment = pattern;
  while (true) {
    const segmentedPat = EString.match(restToSegment, '*@*[*]*');
    if (!segmentedPat) {
      patternProfile.push({ pattern: restToSegment });
      break;
    }
    if (validateMentionNaming(segmentedPat[1])) {
      // isolate the mentionRoute tag
      patternProfile.push({ pattern: segmentedPat[0] });
      // TODO: Mention Tag Calculus
      patternProfile.push({ pattern: segmentedPat[2], mentions: [segmentedPat[1]] });
      restToSegment = segmentedPat[3];
      continue;
    }
    const searchMentionNamePosition = segmentedPat[1].lastIndexOf('@');
    if (searchMentionNamePosition > -1) {
      // isolate the mentionRoute tag
      patternProfile.push({
        pattern: segmentedPat[0] + '@'
          + segmentedPat[1].substring(0, searchMentionNamePosition),
      });
      // TODO: Mention Tag Calculus
      patternProfile.push({
        pattern: segmentedPat[2],
        mentions: [segmentedPat[1].substring(searchMentionNamePosition + 1)],
      });
      restToSegment = segmentedPat[3];
      continue;
    }
    patternProfile.push({ pattern: restToSegment });
  }
  return patternProfile;
}

function cartesianAllScopes(
  synonyms: MentionRoute[],
  patternProfile: ReturnType<typeof segmentScope>)
  : Array<Array<{ pattern: string, mentionTag?: string, innerPattern?: string }>> {
  return patternProfile.reduce((agg, current) => {
    if (agg.length < 1) {
      return [[current]];
    }
    if (current.mentions) {
      let possibleWords: Array<{ pattern: string, mentionTag?: string, annotation?: string }> = [];
      current.mentions.forEach(mentionTag => {
        const mentionRoute = synonyms.find(synonym => synonym.tag === mentionTag);
        // const annotation = synonyms.find(synonym => synonym.tag === mentionTag);
        if (mentionRoute) {
          possibleWords = possibleWords.concat(
            mentionRoute.words.map(word =>
              ({ pattern: word, mentionTag, innerPattern: current.pattern })));
          // } else if (annotation) {
        } else {
          throw new NoMentionDefException(mentionTag);
        }
      });
      return cartesian(agg, possibleWords).map(comb => [...comb[0], comb[1]]);
    } else {
      return cartesian(agg, [current]).map(comb => [...comb[0], comb[1]]);
    }
  }, [] as ReturnType<typeof cartesianAllScopes>);
}

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
 * Learned from `SynList.matchDecomp(String str, String pat, String[] segmentedPat)`
 */
export function matchDecomposition<P extends keyof any>(
  synonyms: MentionRoute[], str: string, pat: string): HyperDecomposition | null {
  const patternProfile = segmentScope(pat);
  if (patternProfile.length < 3) {
    // no tagged mentionRoute in decomposition pattern
    const simpleMatch = EString.match(str, pat);
    return simpleMatch ? { slottedTokens: simpleMatch, scopes: {} } : null;
  }
  //  Look up the synonym
  const cartesianAllSyn = cartesianAllScopes(synonyms, patternProfile);
  let matchedParts: string[] = [];
  //  Try each synonym individually
  const matchedPattern = cartesianAllSyn.find(patternParts => {
    // Make a modified pattern
    const matchAttempt = EString.match(str, patternParts.map(p => p.pattern).join(''));
    if (matchAttempt) {
      matchedParts = matchAttempt;
    }
    return !!matchAttempt;
  });
  if (!matchedPattern) {
    return null;
  }
  const ensuredParts = matchedParts;
  const hyperDecomposeRes: HyperDecomposition = {
    slottedTokens: [],
    scopes: {},
  };
  matchedPattern.forEach(p => {
    const expectedParts = EString.count(p.pattern, '*');
    if (p.mentionTag && p.innerPattern) {
      const innerDecomposition = matchDecomposition(
        synonyms, p.pattern, p.innerPattern);
      if (!innerDecomposition) {
        throw new Error(
          `Fatal Error: Decomposing in scope failed: [${p.pattern}] --> [${p.innerPattern}]`);
      }
      innerDecomposition.slottedTokens
        .forEach(part => hyperDecomposeRes.slottedTokens.push(part));
      hyperDecomposeRes.scopes[p.mentionTag] =
        { text: p.pattern, mentionTag: p.mentionTag };
      return;
    }
    for (let index = 0; index < expectedParts; index++) {
      const part = ensuredParts.shift();
      if (part === undefined || part === null) {
        throw new Error('Fatal Error: Extracted Terms not matching wildcards!');
      }
      hyperDecomposeRes.slottedTokens.push(part);
    }
  });
  return hyperDecomposeRes;
}
