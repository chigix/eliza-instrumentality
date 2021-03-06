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
  ).toEqual({
    slottedTokens: [
      { scopes: {}, token: ' hello ' },
    ], scopes: {},
  });
  expect(
    matchDecomposition([mentions.everyone],
      ' Everybody hates me ', '* @everyone[*] *'),
  ).toEqual(null);
  expect(
    matchDecomposition([mentions.sad],
      ' I am unhappy ', '* @sad[*] *'),
  ).toEqual({
    slottedTokens: [
      { scopes: {}, token: ' I am' },
      { scopes: { sad: { mentionTag: 'sad', text: 'unhappy' } }, token: 'unhappy' },
      { scopes: {}, token: '' },
    ],
    scopes: { sad: { mentionTag: 'sad', text: 'unhappy' } },
  });
});

test('Match Multiple Mentions', () => {
  expect(matchDecomposition([mentions.everyone],
    ' everybody hates me ', '* @everyone[*] *')).toStrictEqual({
      slottedTokens: [
        { scopes: {}, token: '' },
        { scopes: { everyone: { mentionTag: 'everyone', text: 'everybody' } }, token: 'everybody' },
        { scopes: {}, token: 'hates me ' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'everybody' },
      },
    });
  expect(() => matchDecomposition([mentions.everyone],
    ' nobody hates my dad ', '* @everyone[*] * @family[*] *')).toThrowError();
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' nobody hates my dad ', '* @everyone[*] * @family[*] *')).toStrictEqual({
      slottedTokens: [
        { scopes: {}, token: '' },
        { scopes: { everyone: { mentionTag: 'everyone', text: 'nobody' } }, token: 'nobody' },
        { scopes: {}, token: 'hates my' },
        { scopes: { family: { mentionTag: 'family', text: 'dad' } }, token: 'dad' },
        { scopes: {}, token: '' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'nobody' },
        family: { mentionTag: 'family', text: 'dad' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' nobody hates my children ', '* @everyone[*] * @family[*ren] *')).toStrictEqual({
      slottedTokens: [
        { scopes: {}, token: '' },
        { scopes: { everyone: { mentionTag: 'everyone', text: 'nobody' } }, token: 'nobody' },
        { scopes: {}, token: 'hates my' },
        { scopes: { family: { mentionTag: 'family', text: 'children' } }, token: 'child' },
        { scopes: {}, token: '' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'nobody' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' no one hates my children ', '* @everyone[*] * @family[*ren] *')).toStrictEqual({
      slottedTokens: [
        { scopes: {}, token: '' },
        { scopes: { everyone: { mentionTag: 'everyone', text: 'no one' } }, token: 'no one' },
        { scopes: {}, token: 'hates my' },
        { scopes: { family: { mentionTag: 'family', text: 'children' } }, token: 'child' },
        { scopes: {}, token: '' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'no one' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' @attack-at-mark: no one hates my children ', ' @attack-at-mark: @everyone[*] * @family[*ren] ')).toStrictEqual({
      slottedTokens: [
        { scopes: { everyone: { mentionTag: 'everyone', text: 'no one' } }, token: 'no one' },
        { scopes: {}, token: 'hates my' },
        { scopes: { family: { mentionTag: 'family', text: 'children' } }, token: 'child' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'no one' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' @attack-at-mark: no one hates my children ', ' @attack-at-mark: @everyone[*] * @family[*ren] ')).toStrictEqual({
      slottedTokens: [
        { scopes: { everyone: { mentionTag: 'everyone', text: 'no one' } }, token: 'no one' },
        { scopes: {}, token: 'hates my' },
        { scopes: { family: { mentionTag: 'family', text: 'children' } }, token: 'child' },
      ],
      scopes: {
        everyone: { mentionTag: 'everyone', text: 'no one' },
        family: { mentionTag: 'family', text: 'children' },
      },
    });
});

test('Matching Scenario in Japanese', () => {
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' 私は研究者です ', '*私は*です')).toBeNull();
  expect(matchDecomposition([mentions.everyone, mentions.family],
    ' 私は研究者です ', '*私は*です*')).toStrictEqual({
      slottedTokens: [
        { scopes: {}, token: ' ' },
        { scopes: {}, token: '研究者' },
        { scopes: {}, token: ' ' },
      ],
      scopes: {},
    });
});
