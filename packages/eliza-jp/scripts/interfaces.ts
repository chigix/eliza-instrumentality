export interface ScriptTemplate {
  addPostReplace(src: string, dest: string): this;
  addCollocationFix(src: string, dest: string): this;
  addMention(mentionTag: string, words: string[]): this;
  compileToString(): string;
}

export interface NounProfile {
  /**
   * 家族
   */
  surface: string;
  /**
   * カゾク
   */
  reading: string;
  /**
   * かぞく
   */
  readingHiragana: string;
}

export interface AdjProfile {
  /**
   * 難しい
   */
  surface: string;
  /**
   * 文語基本形
   */
  influenceForm: string;
  /**
   * カゾク
   */
  reading: string;
  /**
   * かぞく
   */
  readingHiragana: string;
}

export interface VerbProfile {
  /**
   * 走れ
   */
  surface: string;
  /**
   * 動詞,自立,*,*
   */
  partOfSpeech: string[];
  /**
   * 五段・ラ行
   */
  influenceType: string;
  /**
   * 連用形
   */
  influenceForm: string;
  /**
   * 走る
   */
  baseForm: string;
  reading: string;
}
