import { Reassemble } from './Reassemble';
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
   * @param {Reassemble[]} reassembles The reassembly list
   * @memberof Decomp
   */
  constructor(
    private pattern: string,
    private mem: boolean,
    private reassembles: Reassemble[]) { }

  /**
   * pattern
   */
  public getPattern() {
    return this.pattern;
  }

  /**
   * Get the mem flag.
   */
  public isMemoryKey() {
    return this.mem;
  }

  /**
   * getReasemb
   */
  public getReasemb() {
    return this.reassembles.filter(r => !r.isAnnotated());
  }

  public getAnnotates() {
    return this.reassembles.filter(r => r.isAnnotated());
  }

  /**
   * Step to the next reassembly rule.
   * If mem is true, pick a random rule.
   *
   * This function merged `Decomp.stepRule()` and `Decomp.nextRule()`
   * from original code.
   */
  public nextRule() {
    const reassembles = this.reassembles.filter(r => !r.isAnnotated());
    if (this.isMemoryKey()) {
      this.currReasmb = Math.floor(Math.random() * reassembles.length);
    }
    // Increment and make sure it is within range.
    if (++this.currReasmb >= reassembles.length) {
      this.currReasmb = 0;
    }
    if (reassembles.length < 1) {
      throw new NoReassemblyRuleException();
    }

    return reassembles[this.currReasmb];
  }
}
