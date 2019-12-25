import { Decomp } from './decompo';

export type Word = string;
export interface MentionRoute {
  tag: Word;
  words: Word[];
}

export interface DecomposedSlot {
  token: string;
  scopes: {
    [key: string]: { text: string, mentionTag?: string },
  };
}

export interface HyperDecomposition {
  slottedTokens: DecomposedSlot[];
  scopes: {
    [key: string]: { text: string, mentionTag?: string },
  };
}

export interface ReassembleContext {
  decomposition?: Decomp;
  matches?: HyperDecomposition;
  assembled: {
    reassembled: string,
    annotations?: {
      [annotate: string]: string,
    },
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
