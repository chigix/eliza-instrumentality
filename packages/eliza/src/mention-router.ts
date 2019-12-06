import * as EString from './estring';
import { MentionRoute, HyperDecomposition } from './interfaces';
import { NoMentionDefException } from './exceptions';
import { cartesian } from './utils';

function segmentScope(pattern: string) {
  const patternProfile: Array<{ pattern: string, mentions?: string[] }> = [];
  let restToSegment = pattern;
  while (true) {
    const segmentedPat = EString.match(restToSegment, '*@*[*]*');
    if (!segmentedPat) {
      patternProfile.push({ pattern: restToSegment });
      break;
    }
    // isolate the mentionRoute tag
    patternProfile.push({ pattern: segmentedPat[0] });
    // TODO: Mention Tag Calculus
    patternProfile.push({ pattern: segmentedPat[2], mentions: [segmentedPat[1]] });
    restToSegment = segmentedPat[3];
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
export function matchDecomposition(
  synonyms: MentionRoute[], str: string, pat: string): HyperDecomposition | null {
  const patternProfile = segmentScope(pat);
  if (patternProfile.length < 3) {
    // no tagged mentionRoute in decomposition pattern
    const simpleMatch = EString.match(str, pat);
    return simpleMatch ? {
      slottedTokens: simpleMatch.map(t => ({
        token: t, scopes: {},
      })), scopes: {},
    } : null;
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
      const mentionTag = p.mentionTag;
      const innerDecomposition = matchDecomposition(
        synonyms, p.pattern, p.innerPattern);
      if (!innerDecomposition) {
        throw new Error(
          `Fatal Error: Decomposing in scope failed: [${p.pattern}] --> [${p.innerPattern}]`);
      }
      innerDecomposition.slottedTokens
        .forEach(part => {
          part.scopes[mentionTag] = {
            text: p.pattern, mentionTag: p.mentionTag,
          };
          hyperDecomposeRes.slottedTokens.push(part);
        });
      hyperDecomposeRes.scopes[mentionTag] = {
        text: p.pattern, mentionTag: p.mentionTag,
      };
      return;
    }
    for (let index = 0; index < expectedParts; index++) {
      const part = ensuredParts.shift();
      if (part === undefined || part === null) {
        throw new Error('Fatal Error: Extracted Terms not matching wildcards!');
      }
      hyperDecomposeRes.slottedTokens.push({ token: part, scopes: {} });
    }
  });
  return hyperDecomposeRes;
}
