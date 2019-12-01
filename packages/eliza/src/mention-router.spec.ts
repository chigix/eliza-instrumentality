import { matchDecomposition } from './mention-router';

const mentions = {
  belief: {
    tag: 'belief',
    words: ['feel', 'think', 'believe', 'wish'],
  },
  family: {
    tag: 'family',
    words: ['mother', 'mom', 'father', 'dad',
      'sister', 'brother', 'wife', 'children', 'child'],
  },
  desire: {
    tag: 'desire',
    words: ['want', 'need'],
  },
  sad: {
    tag: 'sad',
    words: ['unhappy', 'depressed', 'sick'],
  },
  everyone: {
    tag: 'everyone',
    words: ['everybody', 'nobody', 'Nobody', 'no one'],
  },
};

test('Match check for pre rule', () => {
  expect(
    matchDecomposition([mentions.belief], ' hello ', '*'),
  ).toEqual({ slottedTokens: [' hello '], scopes: {} });
  expect(
    matchDecomposition([mentions.everyone],
      ' Everybody hates me ', '* @everyone[*] *'),
  ).toEqual(null);
  expect(
    matchDecomposition([mentions.sad],
      ' I am unhappy ', '* @sad[*] *'),
  ).toEqual({
    slottedTokens: [' I am', 'unhappy', ''],
    scopes: { sad: { mentionTag: 'sad', text: 'unhappy' } },
  });
});

test('Match Multiple Mentions', () => {
  expect(matchDecomposition([mentions.everyone],
    ' everybody hates me ', '* @everyone[*] *')).toStrictEqual({
      slottedTokens: ['', 'everybody', 'hates me '],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'everybody' },
      },
    });
  expect(() => matchDecomposition([mentions.everyone],
    ' nobody hates my dad ', '* @everyone[*] * @family[*] *')).toThrowError();
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' nobody hates my dad ', '* @everyone[*] * @family[*] *')).toStrictEqual({
      slottedTokens: ['', 'nobody', 'hates my', 'dad', ''],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'nobody' },
        family: { mentionTag: 'family', text: 'dad' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' nobody hates my children ', '* @everyone[*] * @family[*ren] *')).toStrictEqual({
      slottedTokens: ['', 'nobody', 'hates my', 'child', ''],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'nobody' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' no one hates my children ', '* @everyone[*] * @family[*ren] *')).toStrictEqual({
      slottedTokens: ['', 'no one', 'hates my', 'child', ''],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'no one' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
});
