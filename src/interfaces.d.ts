export type Reasemb = string;
export type Word = string;
export type MentionRoute = {
  tag: Word,
  words: Word[],
};

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
