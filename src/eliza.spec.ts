import { loadEliza } from './eliza';

test('Instantiate Eliza Main Class', () => {
  const eliza = loadEliza();
  expect(eliza.toJson()).toMatchSnapshot();
});

test('simple initial conversation', () => {
  const eliza = loadEliza();
  expect(eliza.getInitialStr()).toEqual('How do you do.  Please tell me your problem.');
  console.log(eliza.processInput('Hello'));
  console.log(eliza.processInput('Everybody hates me'));
  console.log(eliza.processInput('Everybody hates me'));
  console.log(eliza.processInput('Everybody hates me'));
});
