import { ScriptTemplate } from '../interfaces';

export class UserStoryScript implements ScriptTemplate {

  private mentions: Array<{
    tag: string,
    words: string[],
  }> = [];

  private postReplaces: Array<{
    src: string, dest: string,
  }> = [];

  private collocationFix: Array<{
    src: string, dest: string,
  }> = [];

  constructor() {
    // Empty Constructor
  }

  public addPostReplace(src: string, dest: string) {
    this.postReplaces.push({ src, dest });
    return this;
  }

  public addCollocationFix(src: string, dest: string) {
    if (src.endsWith('-たい-')) {
      return this;
    }
    this.collocationFix.push({ src, dest });
    return this;
  }

  public addMention(mentionTag: string, words: string[]) {
    if (['@negativeVerb', '@adjIi', '@wasDoing'].indexOf(mentionTag) > -1) {
      return this;
    }
    this.mentions.push({ tag: mentionTag, words });
    return this;
  }

  /**
   * compile
   */
  public compileToString(): string {
    let script = 'annotate: replyYes\n';
    script += 'annotate: replyNo\n';
    script += 'annotate: userStoryA\n';
    script += 'annotate: userStoryB\n';
    script += 'annotate: aIsDependencyOfB\n';
    script += 'annotate: aHasPurposeB\n';
    script += 'annotate: bIsDependencyOfA\n';
    script += 'annotate: bHasPurposeA\n';
    script += 'initial: ようこそ。どんなことがあったんですか？\n';
    script += 'final: 今日はお疲れ様でした。\n';
    script += 'quit: さよなら\n';
    script += 'quit: 会話終了\n';
    script += 'quit: お疲れ様でした\n';
    script += 'quit: お疲れ様\n';
    script += 'quit: お疲れ\n';
    script += 'quit: おつかれさま\n';
    script += 'quit: おつかれ\n';
    script += 'pre: "僕" => "私"\n';
    script += 'pre: "わたし" => "私"\n';
    script += 'pre: "わたくし " => "私"\n';
    script += 'pre: "エリザさん" => "あなた"\n';
    script += 'pre: "ボットさん" => "あなた"\n';
    script += 'pre: "インターン" => "インターンシップ"\n';
    script += 'pre: "貴方" => "あなた"\n';
    script += 'pre: "ております" => "ています"\n';
    script += 'pre: "のなまえは" => "の名前は"\n';
    script += 'pre: "のなまえが" => "の名前が"\n';
    script += 'pre: "のなまえを" => "の名前を"\n';
    script += 'pre: "欲しい" => "ほしい"\n';
    script += 'pre: "欲しかった" => "ほしかった"\n';
    script += 'post: "あなたの" => "僕の"\n';
    script += 'post: "私" => "あなた"\n';
    script += 'post: "自分" => "あなた自身"\n';
    script += 'post: "あなた自身" => "あなた自身"\n';
    script += 'post: "あなた自身" => "自分"\n';
    script += 'post: "私" => "あなた"\n';
    script += 'post: "あなた" => "僕"\n';
    script += 'post: "私の" => "あなたの"\n';
    script += 'post: "私は" => "あなたは"\n';
    script += 'post: "私が" => "あなたが"\n';
    script += 'post: "子供" => "こども"\n';
    script += 'post: "子供達" => "子供たち"\n';
    script += 'post: "皆は" => "みんなは"\n';
    script += 'post: "皆の" => "みんなの"\n';
    script += 'post: "可愛い" => "かわいい"\n';
    script += 'post: "美味しい" => "おいしい"\n';
    script += this.postReplaces.map(post => [
      'post:', JSON.stringify(post.src), '=>', JSON.stringify(post.dest),
    ].join(' ')).join('\n') + '\n';
    script += this.collocationFix.map(fix => [
      'tweak:', JSON.stringify(fix.src), '=>', JSON.stringify(fix.dest),
    ].join(' ')).join('\n') + '\n';
    script += this.mentions.map(mention => [
      'mention:', mention.tag,
      mention.words.map(word => `"${word}"`).join(','),
    ].join(' ')).join('\n') + '\n';
    script += 'mention: @sad "悲しい", "かなしい", "嬉しくない", "うれしくない", "気分悪い"\n';
    script += 'mention: @happy "嬉しい", "調子がいい", "調子が良い"\n';
    script += 'mention: @cannot "駄目", "出来ない", "出来ません"\n';
    script += 'mention: @everyone "みんな", "皆様", "皆さん", "皆"\n';
    script += 'mention: @computer "計算機", "コンピューター", "コンピュータ", "パソコン", "機械", "マシン"\n';
    script += 'key: xNone\n';
    script += '  decomp: *\n';
    script += '    reasmb: 理解できませんでしたが、もう少し簡潔に教えてもらえますか\n';
    script += 'key: matchYesNo\n';
    script += '  decomp: *はい*\n';
    script += '    replyYes: true\n';
    script += '    replyNo: false\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *いいえ*\n';
    script += '    replyYes: false\n';
    script += '    replyNo: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *ないです*\n';
    script += '    replyYes: false\n';
    script += '    replyNo: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *ありません*\n';
    script += '    replyYes: false\n';
    script += '    replyNo: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *ございません*\n';
    script += '    replyYes: false\n';
    script += '    replyNo: true\n';
    script += '    reasmb: placeholder\n';
    script += 'key: userStoryIdentification\n';
    // TODO: multiple matching template is weak point in current algorithm
    // script += '  decomp: *@rawVerb[*]ため、*@desireVerb[*たい]*\n';
    // script += '    userStoryA: (1)(2)\n';
    // script += '    userStoryB: (4)-る- \n';
    // script += '    aIsDependencyOfB: false\n';
    // script += '    aHasPurposeB: false\n';
    // script += '    bIsDependencyOfA: false\n';
    // script += '    bHasPurposeA: true\n';
    // script += '    reasmb: placeholder\n';
    script += '  decomp: *するため、*@desireVerb[*たい]*\n';
    script += '    userStoryA: (1)する\n';
    script += '    userStoryB: (2) (3)-る- \n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bIsDependencyOfA: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *のため、*@desireVerb[*たい]*\n';
    script += '    userStoryA: (1)\n';
    script += '    userStoryB: (2) (3)-る-\n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bIsDependencyOfA: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@desireVerbHoshii[*ほしかった]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@desireVerbHoshii[*ほしい]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@desireVerb[*たい]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@doing[*います]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '  decomp: *@doingSimple[*いる]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@rawVerb[*]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *です*\n';
    script += '    reasmb: いいですね。それで？\n';
    script += '    reasmb: そうですね。\n';
    script += '    reasmb: 続きを教えてください。\n';
    script += 'key: xQuestion\n';
    script += '  decomp: *@confirm-dependency: * => *\n';
    script += '    reasmb: (2) は (3) の前で終わる必要ありますか ?\n';
    script += '  decomp: *@confirm-clarification: * => *\n';
    script += '    reasmb: (2) は (3) を意図したものですか ?\n';
    script += '  decomp: *@request-user-story *\n';
    script += '    reasmb: 今は何をやっていますか ?\n';
    script += '  decomp: *@request-purpose: *\n';
    script += '    reasmb: 何のために、(3) をやっているのでしょうか教えてほしいです。\n';
    script += '  decomp: *\n';
    script += '    reasmb: システムが混乱しちゃいました。。\n';

    return script;
  }
}
