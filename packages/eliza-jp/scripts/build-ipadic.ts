import * as iconv from 'iconv-lite';
import * as fs from 'fs';
import { Builder } from './template';
import { VerbProfile, NounProfile, AdjProfile } from './interfaces';
import { replaceAll } from './utils';

export function notEmpty<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function toHiragana(str: string) {
  const k = 'アイウエオカキクケコガギグゲゴサシスセソザジズゼゾタチツテトダヂヅデドナニヌネノハヒフヘホパピプペポバビブベボマミムメモヤユヨラリルレロワンァィゥェォヵャュョ';
  const h = 'あいうえおかきくけこがぎぐげごさしすせそざじずぜぞたちつてとだぢづでどなにぬねのはひふへほぱぴぷぺぽばびぶべぼまみむめもやゆよらりるれろわんぁぃぅぇぉゕゃゅょ';
  return replaceAll(str, k, h);
}

export async function build(paths: {
  dicDir: string,
}) {
  const verbBin = fs.readFileSync(paths.dicDir + '/Verb.csv');
  const verbCsv = iconv.decode(verbBin, 'EUC-JP');
  const verbProfiles: VerbProfile[] = verbCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      partOfSpeech: [line[4], line[5], line[6], line[7]],
      influenceType: line[8],
      influenceForm: line[9],
      baseForm: line[10],
      reading: line[11],
    }));
  const verbalBin = fs.readFileSync(paths.dicDir + '/Noun.verbal.csv');
  const verbalCsv = iconv.decode(verbalBin, 'EUC-JP');
  const verbalProfiles: NounProfile[] = verbalCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const nounBin = fs.readFileSync(paths.dicDir + '/Noun.csv');
  const nounCsv = iconv.decode(nounBin, 'EUC-JP');
  const nounProfiles: NounProfile[] = nounCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const adjBin = fs.readFileSync(paths.dicDir + '/Adj.csv');
  const adjCsv = iconv.decode(adjBin, 'EUC-JP');
  const adjProfiles: AdjProfile[] = adjCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      influenceForm: line[9],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const builder = new Builder()
    .addMention('@verbal', verbalProfiles
      .map(verbal => verbal.surface))
    .addMention('@adjIi', adjProfiles
      .filter(adj => adj.influenceForm === '基本形')
      .map(adj => adj.surface))
    .addMention('@ifVerb', verbProfiles
      .filter(verb => ['仮定形', '連用タ接続'].indexOf(verb.influenceForm))
      .map(verb => verb.surface + 'たら'))
    .addMention('@negativeVerb', verbProfiles
      .filter(verb => verb.influenceForm === '未然形')
      .map(verb => verb.surface + 'ない').concat(
        verbProfiles.filter(verb => verb.influenceForm === '連用形')
          .map(verb => verb.surface + 'ません'),
      ))
    .addMention('@desireVerb', verbProfiles
      .filter(verb => verb.influenceForm === '連用形')
      .map(verb => verb.surface + 'たい'))
    .addMention('@desireVerbHoshii', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'てほしい', verb.surface + 'でほしい',
        verb.surface + 'てほしかった', verb.surface + 'でほしかった',
        verb.surface + 'て欲しい', verb.surface + 'で欲しい',
        verb.surface + 'て欲しかった', verb.surface + 'で欲しかった',
      ].join(','))
      .join(',').split(','))
    .addMention('@doing', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'ています', verb.surface + 'でいます',
        verb.surface + 'ている', verb.surface + 'でいる',
      ].join(','))
      .join(',').split(','))
    .addMention('@wasDoing', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'ていました', verb.surface + 'でいました',
        verb.surface + 'ていた', verb.surface + 'でいた',
      ].join(','))
      .join(',').split(','))
    .addMention('@belief', ['思う', '信じる', '考える', '願う']
      .map(verb => verbProfiles.find(w =>
        w.baseForm === verb && w.influenceForm === '連用タ接続'))
      .filter(notEmpty).map(profile => [
        profile.surface + 'ています', profile.surface + 'ている', profile.baseForm,
      ].join(',')).join(',').split(','))
    .addMention('@family', ['家族', 'お母さん', '母親', '母',
      'お兄さん', '兄', 'お父さん', '父親', '父', '弟', '妹', '妻', '子供達', '子供']
      .map(noun => nounProfiles.find(w =>
        w.surface === noun))
      .filter(notEmpty).map(noun => [
        noun.surface, noun.reading, noun.readingHiragana,
      ].join(',')).join(',').split(','));
  verbProfiles.filter(verb => verb.influenceForm === '連用タ接続').forEach(verb => {
    const destForm = verbProfiles.find(searchVerb =>
      searchVerb.baseForm === verb.baseForm && searchVerb.influenceForm === '連用形');
    if (!destForm) {
      return;
    }
    builder.addCollocationFix(` ${verb.surface}-たい `, `${destForm.surface}たい`);
  });
  verbProfiles.filter(verb => verb.influenceForm === '連用形').forEach(verb => {
    builder.addCollocationFix(` ${verb.surface}-る `, `${verb.baseForm}`);
  });
  return builder.compile();
}
