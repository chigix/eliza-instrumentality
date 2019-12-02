import { loadEliza, loadElizaInEnglish } from './eliza';
import { fromFile, SCRIPT_PATH } from 'eliza-util';

test('Instantiate Eliza Main Class', async () => {
  const eliza = await loadEliza(fromFile(SCRIPT_PATH + '/eliza.script'));
  expect(eliza.toJson()).toMatchSnapshot();
});

test('simple initial conversation', async () => {
  const eliza = await loadElizaInEnglish(fromFile(SCRIPT_PATH + '/eliza.script'));
  expect(eliza.getInitialStr())
    .toEqual('How do you do.  Please tell me your problem.');
  expect(eliza.processInput('Hello'))
    .toEqual('How do you do.  Please state your problem.');
  expect(eliza.processInput('Everybody hates me'))
    .toEqual('Really, everybody ?');
  expect(eliza.processInput('Everybody hates me'))
    .toEqual('Surely not everybody.');
  expect(eliza.processInput('Everybody hates me'))
    .toEqual('Can you think of anyone in particular ?');
});

test('eliza script', async () => {
  const eliza = await loadElizaInEnglish(fromFile(SCRIPT_PATH + '/eliza.script'));
  expect(eliza.processInput('Men are all alike.'))
    .toEqual('In what way ?');
  expect(eliza.processInput('They\'re always debugging us about something or other.'))
    .toEqual('Can you think of a specific example ?');
  expect(eliza.processInput('Well, my boyfriend made me come here.'))
    .toEqual('Your boyfriend made you come here  ?');
  expect(eliza.processInput('He says I\'m depressed much of the time.'))
    .toEqual('I am sorry to hear that you are depressed.');
  expect(eliza.processInput('It\'s true. I am unhappy.'))
    .toEqual('Do you think that coming here will help you not to be unhappy ?');
  expect(eliza.processInput('I need some help, that much seems certain.'))
    .toEqual('What would it mean to you if you got some help  ?');
  expect(eliza.processInput('Perhaps I could learn to get along with my mother.'))
    .toEqual('Tell me more about your family.');
  expect(eliza.processInput('My mother takes care of me.'))
    .toEqual('Who else in your family takes care of you  ?');
  expect(eliza.processInput('My father.'))
    .toEqual('Your father ?');
  expect(eliza.processInput('You are like my father in some ways.'))
    .toEqual('What resemblance do you see ?');
  expect(eliza.processInput('You are not very aggressive but I think you don\'t want me to notice that.'))
    .toEqual('What makes you think I am not very aggressive but you think I don\'t want you to notice that  ?');
  expect(eliza.processInput('You don\'t argue with me.'))
    .toEqual('Why do you think I don\'t argue with you ?');
  expect(eliza.processInput('You are afraid of me.'))
    .toEqual('Does it please you to believe I am afraid of you  ?');
  expect(eliza.processInput('My father is afraid of everybody.'))
    .toEqual('What else comes to mind when you think of your father ?');
  expect(eliza.processInput('Bullies.'))
    .toEqual('Does that have anything to do with the fact that your boyfriend made you come here  ?');
});
