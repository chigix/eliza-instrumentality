export type Reasemb = string;
export type Word = string;
export interface MentionRoute {
  tag: Word;
  words: Word[];
}

export type SlotDecomposition = string[];

export interface HyperDecomposition {
  slottedTokens: SlotDecomposition;
  scopes: {
    [key: string]: { text: string, mentionTag?: string, annotation?: string },
  };
}

/**
 * Eliza pre-post entry (two words).
 * This is used to store pre transforms or post transforms.
 *
 * @export
 * @interface PrePost
 */
export interface PrePost {
  /** The words */
  src: string;
  dest: string;
}
