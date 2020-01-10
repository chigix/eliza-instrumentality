import {
  amatch, findWildString, findNum,
  match,
} from './estring';

test('Length check for pre rule', () => {
  expect(amatch('pre: dont don\'t', 'pre: * *')).toBe(5);
  expect(amatch('synon: belief feel think believe wish', 'reasmb: *')).toBe(-1);
  expect(amatch('d', 'decomp: *')).toBe(1);
  expect(amatch('', 'ecomp: *')).toBe(-1);
  expect(amatch('   reasmb: Do you wish that (2) ?', 'reasmb: *')).toBe(-1);
  expect(amatch('your my', ' *')).toBe(-1);
  expect(amatch(' my', ' *')).toBe(1);
});

test('Match check for pre rule', () => {
  expect(findWildString('dont don\'t', ' *')).toBe(4);
});

test('Match check for number detection', () => {
  expect(findNum('5123421-1234asdf')).toBe(7);
  expect(findNum('5asdf')).toBe(1);
  expect(findNum('asdf')).toBe(0);
});

test('Match check in comparing patterns', () => {
  expect(match('*', '*@* *')).toBeNull();
});

test('Match Japanese Patterns', () => {
  expect(match('今日は気分悪いです', '*悪い*')).toStrictEqual([
    '今日は気分', 'です']);
  expect(match('*ですか', '*@*[*]*')).toBeNull();
  expect(match(' 私は研究者です ', '*私は*です*')).toStrictEqual([
    ' ', '研究者', ' ']);
  expect(match(
    ' @confirm-clarification: 料理を勉強する => 料理教室へ通うため -ため- ',
    '*@confirm-clarification: *する* => * -ため-*'))
    .toStrictEqual([' ', '料理を勉強', '', '料理教室へ通うため', ' ']);
});
