import { ScriptTemplate } from '../interfaces';

export class ElizaScriptBuilder implements ScriptTemplate {

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
    this.collocationFix.push({ src, dest });
    return this;
  }

  public addMention(mentionTag: string, words: string[]) {
    this.mentions.push({ tag: mentionTag, words });
    return this;
  }

  /**
   * compile
   */
  public compileToString(): string {
    let script = 'initial: ようこそ。どんなことがあったんですか？\n';
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
    script += 'post: "インターン" => "インターンシップ"\n';
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
    script += 'key: xnone\n';
    script += '  decomp: *\n';
    script += '    reasmb: いいですね。もう少し詳しく教えてくださいますか\n';
    script += '    reasmb: いいですね。それで？\n';
    script += '    reasmb: そうかもしれませんね。そして？\n';
    script += '    reasmb: それは興味深い点ですね。それでどうなりました？\n';
    script += 'key: confirmation\n';
    script += '  decomp: *ですか*\n';
    script += '    reasmb: なぜ (1) のことに気になっていますか ？\n';
    script += '    reasmb: あなたは (1) ではないとは思いますか ?\n';
    script += '    reasmb: goto what\n';
    script += '  decomp: *ですね*\n';
    script += '    reasmb: いいですね。それで？\n';
    script += '    reasmb: そうですね。\n';
    script += '    reasmb: 続きを教えてください。\n';
    script += 'key: predicate\n';
    script += '  decomp: *私は@adjIi[*]*\n';
    script += '    reasmb: あなたは (2) と思っていますか ?\n';
    script += '    reasmb: あなたは (2)-と 思っていますか ?\n';
    script += '  decomp: *私は*です*\n';
    script += '    reasmb: あなたは (2) だと思っていますか ?\n';
    script += '    reasmb: あなたは (2) になりたいのですか ?\n';
    script += '    reasmb: 僕に (2) と言ってほしいですか ?\n';
    script += '    reasmb: もし (2) だったら、何をしますか？\n';
    script += '    reasmb: goto what\n';
    script += '  decomp: *彼らは*です*\n';
    script += '    reasmb: もし (2) ではなかったら ?\n';
    script += '    reasmb: 恐らくそうかもしれません.\n';
    script += '  decomp: *\n';
    script += '    reasmb: ごめんなさい、理解できませんでした。\n';
    script += 'key: sorry\n';
    script += '  decomp: *\n';
    script += '    reasmb: 気にしないでください。\n';
    script += '    reasmb: 謝らないでください。\n';
    script += '    reasmb: 大丈夫です。\n';
    script += '    reasmb: ここで謝る必要はないんです。\n';
    script += 'key: sorry-alias\n';
    script += '  decomp: *謝ります*\n';
    script += '    reasmb: goto sorry\n';
    script += '  decomp: *悪かった*\n';
    script += '    reasmb: goto sorry\n';
    script += '  decomp: *わるかった*\n';
    script += '    reasmb: goto sorry\n';
    script += '  decomp: *ごめんなさい*\n';
    script += '    reasmb: goto sorry\n';
    script += '  decomp: *すみません*\n';
    script += '    reasmb: goto sorry\n';
    script += 'key: remember 5\n';
    script += '  decomp: *は覚えている*\n';
    script += '    reasmb: 僕は (1) を忘れられると思っているの？\n';
    script += '    reasmb: なぜ私に今 (1) を思い出させるの？\n';
    script += '    reasmb: goto what\n';
    script += '    reasmb: (1) のことは前話したことある？\n';
    script += '  decomp: *は覚えて*か*\n';
    script += '    reasmb: 僕は (1) を忘れられると思っていますか\n';
    script += '    reasmb: なぜ私に今 (1) を思い出させますか？\n';
    script += '    reasmb: (1) についてもう少し教えてください\n';
    script += '    reasmb: goto what\n';
    script += '    reasmb: (1) のことは前話したことありますか\n';
    script += '  decomp: *覚え*\n';
    script += '    reasmb: それは忘れられないのですか？\n';
    script += 'key: if\n';
    script += '  decomp: *もし*なら*\n';
    script += '    reasmb: それは好きなんですか？\n';
    script += '    reasmb: そうなったらどうしますか\n';
    script += 'key: if-rules\n';
    script += '  decomp: *@ifVerb[*たら]*\n';
    script += '    reasmb: あなたは (2)-たい のですか？\n';
    script += '  decomp: *もし*ならば*\n';
    script += '    reasmb: あんたは (2) のことを思っていますか？\n';
    script += '  decomp: *ならば*\n';
    script += '    reasmb: あなたは (1) のことを気になっていますか？\n';
    script += '  decomp: *になれば*\n';
    script += '    reasmb: あなたは (1) について何か知っていますか？\n';
    script += 'key: dream\n';
    script += '  decomp: *の夢を見ました。*\n';
    script += '    reasmb: 本当、(1) のことはどうでしたか?\n';
    script += '    reasmb: Have you ever fantasized (1) while you were awake ?\n';
    script += '    reasmb: Have you ever dreamed (1) before ?\n';
    script += '    reasmb: goto dream\n';
    script += '  decomp: *夢*\n';
    script += '    reasmb: 何を見ましたか ?\n';
    script += '    reasmb: よく夢を見るんですか ?\n';
    script += 'key: perhaps\n';
    script += '  decomp: かもしれない\n';
    script += '    reasmb: 確信が持てないのはどうしてですか？\n';
    script += '    reasmb: どうしてそう思うのですか？\n';
    script += 'key: name 15\n';
    script += '  decomp: 名前\n';
    script += '    reasmb: その名前にどんな意味があるのでしょうか？\n';
    script += '    reasmb: まだ詳しくないですが、続きを教えてください\n';
    script += 'key: deutsch\n';
    script += '  decomp: * deutsch *\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: ドイツ語はわからないのです。\n';
    script += '  decomp: *ドイツ語*\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: ドイツ語はわからないのです。\n';
    script += 'key: francais\n';
    script += '  decomp: * francais *\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: フランス語はあまり詳しくないのですが\n';
    script += '  decomp: *フランス語*\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: フランス語はあまり詳しくないのですが\n';
    script += 'key: italiano\n';
    script += '  decomp: * italiano *\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: イタリア語は僕にとって難しいです\n';
    script += '  decomp: *イタリア語*\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: イタリア語は僕にとって難しいです\n';
    script += 'key: espanol\n';
    script += '  decomp: * espanol *\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: スペイン語は無理です。\n';
    script += '  decomp: *スペイン語*\n';
    script += '    reasmb: goto xfremd\n';
    script += '    reasmb: スペイン語は無理です。\n';
    script += 'key: xfremd\n';
    script += '  decomp: *\n';
    script += '    reasmb: 僕は日本語しかしゃべれないのです。\n';
    script += 'key: こんにちは\n';
    script += '  decomp: *こんにちは*\n';
    script += '    reasmb: こんにちは。お元気ですか\n';
    script += '    reasmb: ようこそ、どんなことがあったんですか？\n';
    script += 'key: computer\n';
    script += '  decomp: *@computer[*]*\n';
    script += '    reasmb: コンピュータはあなたのことを心配していますか ?\n';
    script += '    reasmb: なぜコンピュータのことを言いますか ?\n';
    script += '    reasmb: コンピュータならどう解決するのを思いますか ?\n';
    script += '    reasmb: コンピュータはどう助けてくれるのかと思いますか ?\n';
    script += '    reasmb: あなたはコンピュータのことをどう思いますか ?\n';
    script += 'key: あなたの\n';
    script += '  decomp: *あなたの*\n';
    script += '    reasmb: なぜ僕の (2) のことに気になりますか ?\n';
    script += '    reasmb: あなたの (2) は ?\n';
    script += '    reasmb: 私の (2) のことですか ?\n';
    script += 'key: desire\n';
    script += '  decomp: *@verbal[*]したい*\n';
    script += '    reasmb: 近頃 (2)する予定があるのですか ?\n';
    script += '  decomp: *@desireVerb[*たい*]*\n';
    script += '    reasmb: 近頃 (2)-る予定があるのですか ?\n';
    script += '  decomp: *@desireVerb[*たい*]*\n';
    script += '    reasmb: 近頃 (2)-る ますとの予定があるのですか ?\n';
    script += '  decomp: *私は*を@desireVerb[*たい*]*\n';
    script += '    reasmb: なぜ (2) を (3)たいのですか?\n';
    script += '  decomp: *私は*へ@desireVerb[*たい*]*\n';
    script += '    reasmb: もし (3)-る ようになりましたら、何をしますか ?\n';
    script += '    reasmb: なぜ (3) たいですか?\n';
    script += '    reasmb: 近頃 (3) ますとの予定があるのですか ?\n';
    script += '    reasmb: もしずっと (3) ませんでしたら ?\n';
    script += '    reasmb: あなたは (3)-る にはどんな意味を持つのでしょうか ?\n';
    script += '    reasmb: あなたは (3)-る にあたって、なにを話したいのでしょうか ?\n';
    script += 'key: sorry\n';
    script += '  decomp: *@sad[*]*\n';
    script += '    reasmb: すいませんでした、(2) のことを話してもらって\n';
    script += '    reasmb: やはり (2) ことにならない可能性は少ないでしょうか ?\n';
    script += '    reasmb: やはり (2) となるのは残念です。\n';
    script += '    reasmb: あなたから (2) となる原因も聞かせてもらえますか ?\n';
    script += 'key: i-am\n';
    script += '  decomp: *@happy[*]*\n';
    script += '    reasmb: ほんとうに (2) ? 私が何かやったのですか？\n';
    script += '    reasmb: 今は何が (3) とさせましたか ?\n';
    script += '    reasmb: なぜ突然 (3) でしょうか?\n';
    script += '  decomp: *と@belief[*]*\n';
    script += '    reasmb: 本当にそう思うのですか ?\n';
    script += '    reasmb: でも (1) はまだ確信出来ていないでしょう.\n';
    script += '    reasmb: あなたは (3) のこと疑うのですか ?\n';
    script += '    reasmb: そう思うのには理由がありますか？\n';
    script += '  decomp: *私は*\n';
    script += '    reasmb: 相談しに来る原因は (2) ですから ?\n';
    script += '    reasmb: いつから (2) となってきましたか ?\n';
    script += '    reasmb: やはり (2) となったことは正しいでしょうか ?\n';
    script += '    reasmb: あなたは (2) となることを楽しんでいるでしょう ?\n';
    script += '  decomp: *@cannot[*]*\n';
    script += '    reasmb: なぜ (3) と思うのでしょうか ?\n';
    script += '    reasmb: 試してみましたか ?\n';
    script += '    reasmb: いまは多分できるようになりました \n';
    script += '    reasmb: 本当にできるようにしたいのですか？\n';
    script += '  decomp: *しない*\n';
    script += '    reasmb: 本当に (1) のことをしないですか ?\n';
    script += '    reasmb: あなたは (1) をしたいですか ?\n';
    script += '    reasmb: 何か問題があったのですか ?\n';
    script += '  decomp: *と感じてい*\n';
    script += '    reasmb: その感覚をもう少し教えてください.\n';
    script += '    reasmb: 結構 (2) と感じていきましたか ?\n';
    script += '    reasmb: この (2) 感覚は楽しんでいますか ?\n';
    script += '  decomp: あなたのこと*@desireVerb[*たい]*\n';
    //             reasmb: Perhaps in your fantasies we (2) each other.
    script += '    reasmb: 互に (2) ませんか\n';
    //             reasmb: Do you wish to (2) me ?
    script += '    reasmb: 私を (2) たいですか \n';
    script += 'key: you\n';
    //           decomp: * you remind me of *
    script += '  decomp: *教えてください\n';
    script += '    reasmb: goto alike\n';
    // script += '  decomp: * you are *\n';
    // script += '    reasmb: What makes you think I am (2) ?\n';
    // script += '    reasmb: Does it please you to believe I am (2) ?\n';
    // script += '    reasmb: Do you sometimes wish you were (2) ?\n';
    // script += '    reasmb: Perhaps you would like to be (2).\n';
    // script += '  decomp: * you* me *\n';
    // script += '    reasmb: Why do you think I (2) you ?\n';
    // script += '    reasmb: You like to think I (2) you -- don't you ?\n';
    // script += '    reasmb: What makes you think I (2) you ?\n';
    // script += '    reasmb: Really, I (2) you ?\n';
    // script += '    reasmb: Do you wish to believe I (2) you ?\n';
    // script += '    reasmb: Suppose I did (2) you -- what would that mean ?\n';
    // script += '    reasmb: Does someone else believe I (2) you ?\n';
    // script += '  decomp: * you *\n';
    // script += '    reasmb: We were discussing you -- not me.\n';
    // script += '    reasmb: Oh, I (2) ?\n';
    // script += '    reasmb: You're not really talking about me -- are you ?\n';
    // script += '    reasmb: What are your feelings now ?\n';
    script += 'key: yes\n';
    script += '  decomp: *はい*\n';
    script += '    reasmb: あなたは結構ポジティブに見えます。\n';
    script += '    reasmb: そうなのですね。\n';
    script += '    reasmb: 分かりました。\n';
    script += '    reasmb: 了解しました。\n';
    script += 'key: no\n';
    script += '  decomp: *いいえ*\n';
    script += '    reasmb: 何か否定的なことを言ったのですか？\n';
    script += '    reasmb: 少しネガティブに見えてしまいましたが、\n';
    script += '    reasmb: 違いますか ?\n';
    script += '    reasmb: なぜ「いいえ」なのでしょうか ?\n';
    // script += 'key: my 2\n';
    // script += '  decomp: $ * my *\n';
    // script += '    reasmb: Lets discuss further why your (2).\n';
    // script += '    reasmb: Earlier you said your (2).\n';
    // script += '    reasmb: But your (2).\n';
    // script += '    reasmb: Does that have anything to do with the fact that your (2) ?\n';
    // script += '  decomp: * my* @family *\n';
    // script += '    reasmb: Tell me more about your family.\n';
    // script += '    reasmb: Who else in your family (4) ?\n';
    // script += '    reasmb: Your (3) ?\n';
    // script += '    reasmb: What else comes to mind when you think of your (3) ?\n';
    // script += '  decomp: * my *\n';
    // script += '    reasmb: Your (2) ?\n';
    // script += '    reasmb: Why do you say your (2) ?\n';
    // script += '    reasmb: Does that suggest anything else which belongs to you ?\n';
    // script += '    reasmb: Is it important that your (2) ?\n';
    // script += 'key: can\n';
    // script += '  decomp: * can you *\n';
    // script += '    reasmb: You believe I can (2) don't you ?\n';
    // script += '    reasmb: goto what\n';
    // script += '    reasmb: You want me to be able to (2).\n';
    // script += '    reasmb: Perhaps you would like to be able to (2) yourself.\n';
    // script += '  decomp: * can i *\n';
    // script += '    reasmb: Whether or not you can (2) depends on you more than me.\n';
    // script += '    reasmb: Do you want to be able to (2) ?\n';
    // script += '    reasmb: Perhaps you don't want to(2).\n';
    // script += '    reasmb: goto what\n';
    script += 'key: what\n';
    script += '  decomp: *\n';
    script += '    reasmb: なぜ聞きたいですか ?\n';
    script += '    reasmb: あなたはどう思いますか ?\n';
    script += '    reasmb: 何か聞きたいことがあるのですか ?\n';
    script += '    reasmb: 他の人に聞いたことはありますか ?\n';
    script += '    reasmb: 昔もこういう疑問があったのですか ?\n';
    script += 'key: ので\n';
    script += '  decomp: *\n';
    script += '    reasmb: それが本当の理由ですか ?\n';
    script += '    reasmb: ほかの理由がありますか ?\n';
    script += 'key: ですから\n';
    script += '  decomp: *\n';
    script += '    reasmb: goto ので\n';
    script += 'key: why\n';
    script += '  decomp: *なぜ*ますか\n';
    script += '    reasmb: (2)ませんと思うのですか ?\n';
    //             reasmb: Perhaps I will (2) in good time.
    script += '    reasmb: もっといい時に (2) ますので。\n';
    //             reasmb: You want me to (2) ?
    script += '    reasmb: 僕に (2) たいのですか ?\n';
    script += '    reasmb: goto what\n';
    script += '  decomp: *なぜ*@negativeVerb[*ない]んですか*\n';
    //             reasmb: Do you think you should be able to (2) ?
    script += '    reasmb: なぜ (2)-たい と思うのですか ?\n';
    script += '  decomp: *なぜ*@negativeVerb[*ない]のですか*\n';
    //             Do you believe this will help you to (2) ?
    script += '    reasmb: あなたは (2) に役に立つと思うのですか ?\n';
    //             reasmb: Have you any idea why you can't (2) ?
    script += '    reasmb: あんたは (2) ことには何か心当たりがありますか ?\n';
    script += '    reasmb: goto what\n';
    script += '  decomp: *\n';
    script += '    reasmb: goto what\n';
    script += 'key: everyone\n';
    script += '  decomp: *@everyone[*]*\n';
    //             reasmb: Really, (2) ?
    script += '    reasmb: ほんと、(2) ?\n';
    //             reasmb: Can you think of anyone in particular ?
    script += '    reasmb: ほかに特例はないですか\n';
    script += '    reasmb: 例えば誰ですか\n';
    //             reasmb: Who do you think you\'re talking about ?
    script += '    reasmb: 誰かの話をしているのですか ?\n';
    script += 'key: everybody 2\n';
    script += '  decomp: *すべての人*\n';
    script += '    reasmb: goto everyone\n';
    script += '  decomp: *みんなの*\n';
    script += '    reasmb: goto everyone\n';
    script += '  decomp: *みんなは*\n';
    script += '    reasmb: goto everyone\n';
    script += 'key: noone 2\n';
    script += '  decomp: *人はいません*\n';
    script += '    reasmb: goto everyone\n';
    script += 'key: anytime\n';
    script += '  decomp: *いつも*\n';
    script += '    reasmb: 例えばいつですか ?\n';
    script += '    reasmb: 今日もですか ?\n';
    script += '    reasmb: 本当にいつもですか ?\n';
    script += 'key: alike 10\n';
    script += '  decomp: *\n';
    //             reasmb: In what way ?
    script += '    reasmb: どうやるのでしょうか ？\n';
    //             reasmb: What resemblance do you see ?
    script += '    reasmb: どこか似ていると思いますか ?\n';
    //             reasmb: Could here really be some connection ?
    script += '    reasmb: 何かつながりがありそうなのですか ?\n';
    script += 'key: like 10\n';
    script += '  decomp: *は*と似て*\n';
    script += '    reasmb: goto alike\n';

    return script;
  }
}
