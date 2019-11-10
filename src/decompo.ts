import { Reasemb } from './interfaces';
import { NoReassemblyRuleException } from './exceptions';

export class Decomp {
  /**
   * The current reassembly point
   *
   * @private
   * @memberof Decomp
   */
  private currReasmb = 100;

  /**
   * Initialize the decomp rule.
   *
   * @param {string} pattern The decomp pattern
   * @param {boolean} mem The mem flag
   * @param {Reasemb[]} reasemb The reassembly list
   * @memberof Decomp
   */
  constructor(
    private pattern: string,
    private mem: boolean,
    private reasemb: Reasemb[]) {
  }

  /**
   * pattern
   */
  public getPattern() {
    return this.pattern;
  }

  /**
   * Get the mem flag.
   */
  public isAware() {
    return this.mem;
  }

  /**
   * getReasemb
   */
  public getReasemb() {
    return this.reasemb;
  }

  /**
   * Step to the next reassembly rule.
   * If mem is true, pick a random rule.
   *
   * This function merged `Decomp.stepRule()` and `Decomp.nextRule()`
   * from original code.
   */
  public nextRule() {
    if (this.mem) {
      this.currReasmb = Math.floor(Math.random() * this.reasemb.length);
    }
    // Increment and make sure it is within range.
    if (++this.currReasmb >= this.reasemb.length) {
      this.currReasmb = 0;
    }
    if (this.reasemb.length < 1) {
      throw new NoReassemblyRuleException();
    }

    return this.reasemb[this.currReasmb];
  }
}
