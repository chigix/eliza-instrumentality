import { loadEliza, loadElizaInEnglish } from './eliza';
import { fromFile, SCRIPT_PATH } from 'eliza-util';
import { IPADIC, USER_STORY_COMP } from 'eliza-jp';
import { getAssembledReply, getAssembledContext } from './utils';

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
  expect(getAssembledReply(eliza.processInput('Men are all alike.')))
    .toEqual('In what way ?');
  expect(getAssembledReply(eliza.processInput('They\'re always debugging us about something or other.')))
    .toEqual('Can you think of a specific example ?');
  expect(getAssembledReply(eliza.processInput('Well, my boyfriend made me come here.')))
    .toEqual('Your boyfriend made you come here ?');
  expect(getAssembledReply(eliza.processInput('He says I\'m depressed much of the time.')))
    .toEqual('I am sorry to hear that you are depressed.');
  expect(getAssembledReply(eliza.processInput('It\'s true. I am unhappy.')))
    .toEqual('Do you think that coming here will help you not to be unhappy ?');
  expect(getAssembledReply(eliza.processInput('I need some help, that much seems certain.')))
    .toEqual('What would it mean to you if you got some help ?');
  expect(getAssembledReply(eliza.processInput('Perhaps I could learn to get along with my mother.')))
    .toEqual('Tell me more about your family.');
  expect(getAssembledReply(eliza.processInput('My mother takes care of me.')))
    .toEqual('Who else in your family takes care of you ?');
  expect(getAssembledReply(eliza.processInput('My father.')))
    .toEqual('Your father ?');
  expect(getAssembledReply(eliza.processInput('You are like my father in some ways.')))
    .toEqual('What resemblance do you see ?');
  expect(getAssembledReply(eliza.processInput('You are not very aggressive but I think you don\'t want me to notice that.')))
    .toEqual('What makes you think I am not very aggressive but you think I don\'t want you to notice that ?');
  expect(getAssembledReply(eliza.processInput('You don\'t argue with me.')))
    .toEqual('Why do you think I don\'t argue with you ?');
  expect(getAssembledReply(eliza.processInput('You are afraid of me.')))
    .toEqual('Does it please you to believe I am afraid of you ?');
  expect(getAssembledReply(eliza.processInput('My father is afraid of everybody.')))
    .toEqual('What else comes to mind when you think of your father ?');
  expect(getAssembledReply(eliza.processInput('Bullies.')))
    .toEqual('Does that have anything to do with the fact that your boyfriend made you come here ?');
});

test('Japanese Script Testing', async () => {
  const eliza = await loadEliza(fromFile(IPADIC));
  expect(eliza.getInitialStr()).toEqual('ようこそ。どんなことがあったんですか？');
  expect(getAssembledReply(eliza.processInput('こんにちは'))).toEqual('こんにちは。お元気ですか');
  expect(getAssembledReply(eliza.processInput('私は研究者です'))).toEqual('あなたは 研究者 だと思っていますか ?');
  expect(getAssembledReply(eliza.processInput('私はインターンへ行きたいです'))).toEqual('あなたは インターンシップへ行きたい になりたいのですか ?');
  expect(getAssembledReply(eliza.processInput('勉強のため、学校へ行きます'))).toEqual('それは興味深い点ですね。それでどうなりました？');
  expect(getAssembledReply(eliza.processInput('学校へ行ったら、勉強できます'))).toEqual('あなたは行きたいのですか？');
  expect(getAssembledReply(eliza.processInput('はい、分かりました。'))).toEqual('あなたは結構ポジティブに見えます。');
});

test('Semantic Annotation Script', async () => {
  const eliza = await loadEliza(fromFile(USER_STORY_COMP));
  expect(getAssembledContext(eliza.processInput('料理を勉強するため、料理教室へ通いたいです')))
    .toStrictEqual(
      {
        annotations: {
          aHasPurposeB: 'false', aIsDependencyOfB: 'false',
          bHasPurposeA: 'true', bIsDependencyOfA: 'false',
          userStoryA: '料理を勉強する', userStoryB: '料理教室へ通う',
        },
        reassembled: 'placeholder',
      });
  expect(getAssembledContext(eliza.processInput('学校へ行きます')))
    .toStrictEqual(
      {
        annotations: { userStoryA: '学校へ行く' },
        reassembled: 'placeholder',
      });
  expect(getAssembledContext(eliza.processInput('はい')))
    .toStrictEqual(
      {
        annotations: { replyNo: 'false', replyYes: 'true' },
        reassembled: 'placeholder',
      });
  expect(getAssembledContext(eliza.processHyperInput('@confirm-dependency: 料理教室へ通うの => 料理を勉強するの')))
    .toStrictEqual(
      {
        annotations: {},
        reassembled: '料理教室へ通うの は 料理を勉強するの の前で終わる必要ありますか ?',
      });
});
