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
    words: ['everybody', 'nobody', 'Nobody', 'noone'],
  },
};

test('Match check for pre rule', () => {
  expect(
    matchDecomposition([mentions.belief], ' hello ', '*'),
  ).toEqual([' hello ']);
  expect(
    matchDecomposition([mentions.everyone],
      ' Everybody hates me ', '* @everyone *'),
  ).toEqual(null);
  expect(
    matchDecomposition([mentions.everyone],
      ' everybody hates me ', '* @everyone *'),
  ).toEqual(['', 'everybody']);
  expect(
    matchDecomposition([mentions.sad],
      ' I am unhappy ', '* @sad *'),
  ).toEqual([' I am', 'unhappy']);
});
