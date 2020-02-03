import * as iconv from 'iconv-lite';
import * as fs from 'fs';
import { ScriptTemplate } from './interfaces';
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

export async function build(opts: {
  dicDir: string,
  scriptTemplate: ScriptTemplate,
}) {
  const verbBin = fs.readFileSync(opts.dicDir + '/Verb.csv');
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
  const verbalBin = fs.readFileSync(opts.dicDir + '/Noun.verbal.csv');
  const verbalCsv = iconv.decode(verbalBin, 'EUC-JP');
  const verbalProfiles: NounProfile[] = verbalCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const nounBin = fs.readFileSync(opts.dicDir + '/Noun.csv');
  const nounCsv = iconv.decode(nounBin, 'EUC-JP');
  const nounProfiles: NounProfile[] = nounCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const adjBin = fs.readFileSync(opts.dicDir + '/Adj.csv');
  const adjCsv = iconv.decode(adjBin, 'EUC-JP');
  const adjProfiles: AdjProfile[] = adjCsv.split('\n').filter(line => line.length > 0)
    .map(line => line.split(',')).map(line => ({
      surface: line[0],
      influenceForm: line[9],
      reading: line[11],
      readingHiragana: toHiragana(line[11]),
    }));
  const builder = opts.scriptTemplate
    .addMention('@verbal', verbalProfiles
      .map(verbal => verbal.surface).sort((a, b) => b.length - a.length))
    .addMention('@rawVerb', verbProfiles
      .filter(verb => verb.influenceForm === '連用形')
      .filter(verb => ['する', 'す', 'たる', 'く', '得'].indexOf(verb.baseForm) < 0)
      .map(verb => [verb.surface + 'ます', verb.surface + 'ました', verb.baseForm].join(',')).join(',').split(',')
      .sort((a, b) => b.length - a.length))
    .addMention('@done', verbProfiles
      .filter(verb => ['仮定形', '連用タ接続'].indexOf(verb.influenceForm))
      .map(verb => verb.surface + 'た').sort((a, b) => b.length - a.length))
    .addMention('@adjIi', adjProfiles
      .filter(adj => adj.influenceForm === '基本形')
      .map(adj => adj.surface).sort((a, b) => b.length - a.length))
    .addMention('@ifVerb', verbProfiles
      .filter(verb => ['仮定形', '連用タ接続'].indexOf(verb.influenceForm))
      .map(verb => verb.surface + 'たら').sort((a, b) => b.length - a.length))
    .addMention('@negativeVerb', verbProfiles
      .filter(verb => verb.influenceForm === '未然形')
      .map(verb => verb.surface + 'ない').concat(
        verbProfiles.filter(verb => verb.influenceForm === '連用形')
          .map(verb => verb.surface + 'ません'),
      ).sort((a, b) => b.length - a.length))
    .addMention('@desireVerb', verbProfiles
      .filter(verb => verb.influenceForm === '連用形')
      .map(verb => verb.surface + 'たい').sort((a, b) => b.length - a.length))
    .addMention('@desireVerbHoshii', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'てほしい', verb.surface + 'でほしい',
        verb.surface + 'てほしかった', verb.surface + 'でほしかった',
      ].join(',')).join(',').split(',').sort((a, b) => b.length - a.length))
    .addMention('@doing', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'ています', verb.surface + 'でいます',
      ].join(',')).join(',').split(',').sort((a, b) => b.length - a.length))
    .addMention('@doingSimple', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'ている', verb.surface + 'でいる',
      ].join(',')).join(',').split(',').sort((a, b) => b.length - a.length))
    .addMention('@wasDoing', verbProfiles
      .filter(verb => verb.influenceForm === '連用タ接続')
      .map(verb => [
        verb.surface + 'ていました', verb.surface + 'でいました',
        verb.surface + 'ていた', verb.surface + 'でいた',
      ].join(','))
      .join(',').split(',').sort((a, b) => b.length - a.length))
    .addMention('@belief', ['思う', '信じる', '考える', '願う']
      .map(verb => verbProfiles.find(w =>
        w.baseForm === verb && w.influenceForm === '連用タ接続'))
      .filter(notEmpty).map(profile => [
        profile.surface + 'ています', profile.surface + 'ている', profile.baseForm,
      ].join(',')).join(',').split(',').sort((a, b) => b.length - a.length))
    .addMention('@family', ['家族', 'お母さん', '母親', '母',
      'お兄さん', '兄', 'お父さん', '父親', '父', '弟', '妹', '妻', '子供達', '子供']
      .map(noun => nounProfiles.find(w =>
        w.surface === noun))
      .filter(notEmpty).map(noun => [
        noun.surface, noun.reading, noun.readingHiragana,
      ].join(',')).join(',').split(',').sort((a, b) => b.length - a.length));
  verbProfiles.filter(verb => verb.influenceForm === '連用タ接続').forEach(verb => {
    const destForm = verbProfiles.find(searchVerb =>
      searchVerb.baseForm === verb.baseForm && searchVerb.influenceForm === '連用形');
    if (!destForm) {
      return;
    }
    builder.addCollocationFix(` ${verb.surface}-たい-`, `${destForm.surface}たい`);
  });
  verbProfiles.filter(verb => verb.influenceForm === '連用形').forEach(verb => {
    builder.addCollocationFix(` ${verb.surface}ます-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.surface}ました-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.surface}-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.baseForm}-る-`, `${verb.baseForm}`);
  });
  verbProfiles.filter(verb => verb.influenceForm === '連用タ接続').forEach(verb => {
    builder.addCollocationFix(` ${verb.surface}て-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.surface}で-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.surface}た-る-`, `${verb.baseForm}`);
    builder.addCollocationFix(` ${verb.surface}だ-る-`, `${verb.baseForm}`);
  });
  verbProfiles.filter(verb => verb.influenceForm === '未然形').forEach(verb => {
    builder.addCollocationFix(` ${verb.baseForm}-ない-`, `${verb.surface}ない`);
    builder.addCollocationFix(` ${verb.baseForm}-なくな-`, `${verb.surface}なくな`);
  });
  return builder.compileToString();
}
