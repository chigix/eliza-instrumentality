import { Decomp } from './decompo';
import * as estring from './estring';
import { UnexpectedNumberException } from './exceptions';

export class Reassemble {
  private template: string;
  private decompose: Decomp;
  private annotate?: string;

  constructor($template: string, $decompose: Decomp, $annotate?: string) {
    this.template = $template;
    this.decompose = $decompose;
    this.annotate = $annotate;
  }

  public isAnnotated() {
    return !!this.annotate;
  }

  public getAnnotate() {
    if (!this.annotate) {
      throw new Error('This Reassemble is not annotated');
    }
    return this.annotate;
  }

  public getTemplate() {
    return this.template;
  }

  public assemble(decomposedTokens: string[]): {
    gotoKey?: string,
    result?: string,
    annotation?: string,
  } {
    let ruleTemplate = this.template;
    do {
      const lines = estring.match(ruleTemplate, 'goto *');
      if (lines && lines[0]) {
        return {
          gotoKey: lines[0],
        };
      }
    } while (0);
    let work = '';
    do {
      if (estring.match(ruleTemplate, '(#)*')) {
        ruleTemplate = ' ' + ruleTemplate;
        continue;
      }
      const lines = estring.match(ruleTemplate, '* (#)*');
      if (!lines) {
        break;
      }
      //  reassembly ruleTemplate with number substitution
      ruleTemplate = lines[2];        // there might be more
      const n = parseInt(lines[1], 10) - 1;
      if (isNaN(n)) {
        throw new UnexpectedNumberException(lines[1], 'reassembly');
      }
      if (n < 0 || n > decomposedTokens.length) {
        throw new Error(
          `Fatal Error: Substitution number is bad ${lines[1]} in ${this.getTemplate}`);
      }
      const term = decomposedTokens[n];
      work += `${lines[0]} ${term}`;
    } while (true);
    work += ruleTemplate;

    return { result: work, annotation: this.annotate };
  }

}
