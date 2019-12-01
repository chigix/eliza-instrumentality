import { cartesian } from './utils';

test('inspect cartesian', () => {
  expect(cartesian([1, 2], [3, 4]).map(ele => ele.join('')))
    .toEqual(['13', '14', '23', '24']);
  expect(cartesian([[1, 2]], [3]).map(comb => [...comb[0], comb[1]]))
    .toEqual([[1, 2, 3]]);
  expect(cartesian([[1, 2]], [3, 4]).map(comb => [...comb[0], comb[1]]))
    .toEqual([[1, 2, 3], [1, 2, 4]]);
});
