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
    if (['@negativeVerb', '@wasDoing'].indexOf(mentionTag) > -1) {
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
    // Terms for weighting
    script += 'annotate: termAims\n';
    script += 'annotate: termPawns\n';
    script += 'annotate: termPawnLeft\n';
    script += 'annotate: termKnight\n';
    script += 'annotate: termRook\n';
    script += 'annotate: termQueen\n';
    script += 'annotate: termKing\n';
    script += 'initial: ようこそ。どんなことがあったんですか？\n';
    script += 'final: 今日はお疲れ様でした。\n';
    script += 'quit: さよなら\n';
    script += 'quit: 会話終了\n';
    script += 'quit: お疲れ様でした\n';
    script += 'quit: お疲れ様\n';
    script += 'quit: お疲れ\n';
    script += 'quit: おつかれさま\n';
    script += 'quit: おつかれ\n';
    script += 'pre: "，" => "、"\n';
    script += 'pre: ", " => "、"\n';
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
    script += 'post: "私の" => "あなたの"\n';
    script += 'post: "私は" => "あなたは"\n';
    script += 'post: "私が" => "あなたが"\n';
    script += 'post: "私" => "あなた"\n';
    script += 'post: "あなた" => "僕"\n';
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
    script += 'key: what\n';
    script += '  decomp: *@adjIi[*]*\n';
    script += '    reasmb: (2)のは何のことでしょうか\n';
    script += '  decomp: *\n';
    script += '    reasmb: (1)というのは何するのでしょうか\n';
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
    script += '  decomp: *@rawVerb[*]ため、*たい*\n';
    script += '    userStoryA: (1)(2)\n';
    script += '    userStoryB: (4)\n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@done[*]ため、*たい*\n';
    script += '    userStoryA: (1)(2)\n';
    script += '    userStoryB: (4)\n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *するため、*@desireVerb[*たい]*\n';
    script += '    userStoryA: (1)する\n';
    script += '    userStoryB: (2) (3)-る-\n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *のため、*@desireVerb[*たい]*\n';
    script += '    userStoryA: (1)\n';
    script += '    userStoryB: (2) (3)-る-\n';
    script += '    aIsDependencyOfB: false\n';
    script += '    aHasPurposeB: false\n';
    script += '    bHasPurposeA: true\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *のため*\n';
    script += '    userStoryA: (1)\n';
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
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@doingSimple[*いる]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]しています*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]していました*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]している*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]していた*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]します*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]しました*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]する*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@verbal[*]した*\n';
    script += '    userStoryA: (1) (2)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@rawVerb[*]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@done[*]*\n';
    script += '    userStoryA: (1) (2)-る-\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *です*\n';
    script += '    reasmb: いいですね。具体的にやることを教えてください。\n';
    script += '  decomp: *\n';
    script += '    reasmb: goto what\n';
    script += 'key: xVerbTransformation\n';
    script += '  decomp: *@verb-transform: *する* -ため-*\n';
    script += '    reasmb: (2)するため\n';
    script += '  decomp: *@verb-transform: *@rawVerb[*]* -ため-*\n';
    script += '    reasmb: (2) (3)ため\n';
    script += '  decomp: *@verb-transform: * -ため-*\n';
    script += '    reasmb: (2)のため\n';
    script += '  decomp: *@verb-transform: *する* -ないと-*\n';
    script += '    reasmb: (2)しないと\n';
    script += '  decomp: *@verb-transform: *@rawVerb[*]* -ないと-*\n';
    script += '    reasmb: (2) (3)-ない-と\n';
    script += '  decomp: *@verb-transform: * -ないと-*\n';
    script += '    reasmb: (2) ではないと\n';
    script += 'key: xQuestion\n';
    script += '  decomp: *@confirm-equivalence: * => *\n';
    script += '    reasmb: (2) のは (3) のと同じですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *を@rawVerb[*]*\n';
    script += '    reasmb: (2)、 (3) も  (4)-なくな-るのですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *を@verbal[*]する*\n';
    script += '    reasmb: (2)、 (3) は (4)できないのですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *@rawVerb[*]*\n';
    script += '    reasmb: (2)、 (3) も  (4)-なくな-るのですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *@verbal[*]する*\n';
    script += '    reasmb: (2)、 (3) (4)できないのですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *する*\n';
    script += '    reasmb: (2)、 (3)はできないのですか ?\n';
    script += '  decomp: *@confirm-dependency: * -ないと- => *\n';
    script += '    reasmb: (2)、 (3) のことがなくなるのですか ?\n';
    script += '  decomp: *@confirm-clarification: *@rawVerb[*]* => * -ため-*\n';
    script += '    reasmb: (5)、 (2) (3)のでしょうか ?\n';
    script += '  decomp: *@confirm-clarification: *する* => * -ため-*\n';
    script += '    reasmb: (4)、 (2)するのでしょうか ?\n';
    script += '  decomp: *@confirm-clarification: * => * -ため-*\n';
    script += '    reasmb: (3)、 (2)になるのですか ?\n';
    script += '  decomp: *@request-user-story *\n';
    script += '    reasmb: 今は何をやっていますか ?\n';
    script += '  decomp: *@request-purpose: *\n';
    script += '    reasmb: なぜ (2)のですか ?\n';
    script += '  decomp: *@confirm-*: *\n';
    script += '    reasmb: Question Generation Failed: (3)\n';
    script += 'key: xSemanticCapture\n';
    script += '  decomp: *@semantic-capture: *は*を@verbal[*]する*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (4)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *を@verbal[*]する*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *は@verbal[*]する*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *を*に@verbal[*]する*\n';
    script += '    termPawns: (2)\n';
    script += '    termAims: (3)\n';
    script += '    termKing: (4)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *に*を@verbal[*]する*\n';
    script += '    termPawns: (3)\n';
    script += '    termAims: (2)\n';
    script += '    termKing: (4)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *@verbal[*]する*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)する\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *は*を@rawVerb[*]*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (4)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *を@rawVerb[*]*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *は@rawVerb[*]*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *を*に@rawVerb[*]*\n';
    script += '    termPawns: (2)\n';
    script += '    termAims: (3)\n';
    script += '    termKing: (4)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *に*を@rawVerb[*]*\n';
    script += '    termPawns: (3)\n';
    script += '    termAims: (2)\n';
    script += '    termKing: (4)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@semantic-capture: *@rawVerb[*]*\n';
    script += '    termPawns: (2)\n';
    script += '    termKing: (3)\n';
    script += '    reasmb: placeholder\n';
    script += 'key: xUpgradePawns\n';
    script += '  decomp: *@select-pawns: *@verbal[*]の*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termPawns: (4)\n';
    script += '    termKnight: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *での*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termKnight: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *への*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termKnight: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *の@verbal[*]の*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termKnight: (3)\n';
    script += '    termPawns: (4)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *の@verbal[*]*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termPawns: (4)\n';
    script += '    termKnight: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *@verbal[*]*\n';
    script += '    termPawnLeft: (2)\n';
    script += '    termPawns: (4)\n';
    script += '    termKnight: (3)\n';
    script += '    reasmb: placeholder\n';
    script += '  decomp: *@select-pawns: *\n';
    script += '    termPawnLeft: (2)\n';
    script += '    reasmb: placeholder\n';

    return script;
  }
}
