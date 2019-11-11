import { Decomp } from './decompo';

export function createKey(
  key: string,
  rank: number,
  decomp: Decomp[],
) {
  return new Key(key, rank, decomp);
}

export class Key {
  constructor(
    private key: string | null,
    private rank: number,
    private decomp: Decomp[] | null,
  ) { }

  /**
   * copy
   */
  protected copy(k: Key) {
    this.key = k.key;
    this.rank = k.rank;
    this.decomp = k.decomp;
  }

  /**
   * key
   */
  public getKey() {
    return this.key;
  }

  /**
   * The numerical rank
   */
  public getRank() {
    return this.rank;
  }

  /**
   * decomp
   */
  public getDecomp() {
    return this.decomp;
  }
}
