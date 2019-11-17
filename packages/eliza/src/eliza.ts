import isString from 'lodash/isString';
import { Observable, of, concat } from 'rxjs';
import { scan, tap, concatMap, filter } from 'rxjs/operators';
import { Decomp } from './decompo';
import * as estring from './estring';
import * as mention from './mention-router';
import { PrePost, Reasemb, MentionRoute, Word } from './interfaces';
import { Key } from './key';
import { GotoKey } from './key-goto';
import { buildKeyStack } from './key-stack';
import * as PrePostUtil from './pre-post-utils';
import * as printers from './printers';
import {
  UnexpectedNumberException, UnknownRuleException, GotoLostException,
} from './exceptions';

const printSynonyms = true;
const printKeys = true;
const PRINT_PRE_POST = true;
const PRINT_INITIAL_FINAL = true;

export interface Eliza {
  getInitialStr(): string;
  isFinished(): boolean;
  toJson(): void;
  processInput(s: string): string;
}

export async function loadEliza(script$: Observable<string>): Promise<Eliza> {
  const eliza = new ElizaImpl();
  await eliza.readScript(script$).toPromise();
  return eliza;
}

/**
 * Eliza main class
 *
 * @export
 * @class Eliza
 */
class ElizaImpl implements Eliza {

  private mem: string[] = [];
  private keys: Key[] = [];
  private synonyms: MentionRoute[] = [];
  private preList: PrePost[] = [];
  private postList: PrePost[] = [];
  private initialStr = 'Hello.';
  private finalStr = 'Goodbye.';
  private quitList: Word[] = [];
  private lastDecomp: Decomp[] = [];
  private lastReasemb: Reasemb[] | null = [];

  /* Flag whether finished */
  private finished = false;

  constructor() {
    // Empty Constructor
  }

  /**
   * dispose
   *
   * TODO: Remove
   */
  public dispose() {
    // anything here will be called automatically when
    // the parent applet shuts down. for instance, this
    // might shut down a thread used by this library.
  }

  public getInitialStr() {
    return this.initialStr;
  }

  /**
   * finished
   */
  public isFinished() {
    return this.finished;
  }

  /**
   * Process a line of script input
   */
  private collect(s: string) {
    const matchedPattern = [
      {
        pattern: '*reasmb: *',
        onMatched: (matchedParts: string[]) => {
          if (!this.lastReasemb) {
            return console.error('Error: no last reasemb');
          }
          this.lastReasemb.push(matchedParts[1]);
        },
      },
      {
        pattern: '*decomp: *',
        onMatched: (matchedParts: string[]) => {
          if (!this.lastDecomp) {
            return console.error('Error: no last decomp');
          }
          this.lastReasemb = [];
          const temp = matchedParts[1];
          const newMatch = estring.match(temp, '$ *');
          this.lastDecomp.push(new Decomp(
            newMatch ? newMatch[0] : temp,
            newMatch ? true : false,
            this.lastReasemb));
        },
      },
      {
        pattern: '*key: * #*',
        onMatched: (matchedParts: string[]) => {
          this.lastDecomp = [];
          this.lastReasemb = null;
          let n = 0;
          if (matchedParts[2].length > 0) {
            n = parseInt(matchedParts[2], 10);
            if (isNaN(n)) {
              throw new UnexpectedNumberException(matchedParts[2], 'key');
            }
          }
          this.keys.push(new Key(
            matchedParts[1], n, this.lastDecomp));
        },
      },
      {
        pattern: '*key: *',
        onMatched: (matchedParts: string[]) => {
          this.lastDecomp = [];
          this.lastReasemb = null;
          this.keys.push(new Key(matchedParts[1], 0, this.lastDecomp));
        },
      },
      {
        pattern: '*synon: * *',
        onMatched: (matchedParts: string[]) => {
          this.synonyms.push({
            tag: matchedParts[1],
            words: matchedParts[2].split(' '),
          });
        },
      },
      {
        pattern: '*pre: * *',
        onMatched: (matchedParts: string[]) => {
          this.preList.push({ src: matchedParts[1], dest: matchedParts[2] });
        },
      },
      {
        pattern: '*post: * *',
        onMatched: (matchedParts: string[]) => {
          this.postList.push({ src: matchedParts[1], dest: matchedParts[2] });
        },
      },
      {
        pattern: '*initial: *',
        onMatched: (matchedParts: string[]) => {
          this.initialStr = matchedParts[1];
        },
      },
      {
        pattern: '*final: *',
        onMatched: (matchedParts: string[]) => {
          this.finalStr = matchedParts[1];
        },
      },
      {
        pattern: '*quit: *',
        onMatched: (matchedParts: string[]) => {
          this.quitList.push(` ${matchedParts[1]} `);
        },
      },
    ].find(({ pattern, onMatched }) => {
      const matchedParts = estring.match(s, pattern);
      if (matchedParts) {
        onMatched(matchedParts);
        return true;
      }
      return false;
    });
    if (!matchedPattern) {
      throw new UnknownRuleException(s);
    }
  }

  /**
   * Print the stored script
   *
   * TODO: Refactor to `toString()`
   */
  public toJson() {
    const toPrint: {
      keys?: any,
      mentionRoutes?: any,
      preList?: any,
      postList?: any,
      initial?: any,
      final?: any,
      quitList?: any,
    } = {};
    if (printKeys) {
      toPrint.keys = this.keys.map(k => printers.snapshotKey(k));
    }
    if (printSynonyms) {
      toPrint.mentionRoutes = this.synonyms;
    }
    if (PRINT_PRE_POST) {
      toPrint.preList = this.preList;
      toPrint.postList = this.postList;
    }
    if (PRINT_INITIAL_FINAL) {
      toPrint.initial = this.initialStr;
      toPrint.final = this.finalStr;
      toPrint.quitList = this.quitList.join('  ');
    }
    return toPrint;
  }

  /**
   * Process a line of input
   */
  public processInput(s: string) {
    //  Do some input transformations first.
    s = estring.replaceAll(s,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz');
    s = estring.replaceAll(s,
      '@#$%^&*()_-+=~`{[}]|:;<>\\"', '                          ');
    s = estring.replaceAll(s, ',?!', '...');
    //  Compress out multiple space.
    s = estring.compress(s);
    let matchedParts = estring.match(s, '*.*');
    //  Break apart sentences, and do each separately.
    while (matchedParts) {
      const reply = this.sentence(matchedParts[0]);
      if (reply) { return reply; }
      s = estring.trim(matchedParts[1]);
      matchedParts = estring.match(s, '*.*');
    }
    if (s.length > 0) {
      const reply = this.sentence(s);
      if (reply) { return reply; }
    }
    //  Nothing matched, so try memory.
    const m = this.mem.shift();
    if (m) { return m; }
    //  No memory, reply with xnone.
    const key = this.keys.find(k => k.getKey() === 'xnone');
    if (key) {
      const reply = this.decompose(key, s);
      if (isString(reply)) { return reply; }
    }

    //  No xnone, just say anything.
    return 'I am at a loss for words.';
  }

  /**
   * readScript
   */
  public readScript(script$: Observable<string>) {
    return concat(script$, of('\n')).pipe(
      scan(({ buffer }, chunk) => {
        // const split = (line + chunk).split('\n');
        const split = (buffer + chunk).split('\n');
        const rest = split.pop();
        return { buffer: rest || '', lines: split };
      }, { buffer: '', lines: [''] }),
      concatMap(pack => pack.lines),
      filter(line => line.trim().length > 0 && !line.startsWith('%')),
      tap(line => this.collect(line)),
    );
  }

  /**
   * Process a sentence.
   * (1) Make pre transformations
   * (2) Check for quit word.
   * (3) Scan sentence for keys, build key stack.
   * (4) Try decompositions for each key.
   */
  private sentence(s: string): string | null {
    s = PrePostUtil.translate(this.preList, s);
    s = estring.pad(s);
    if (this.quitList.indexOf(s) >= 0) {
      this.finished = true;

      return this.finalStr;
    }
    const keyStack = buildKeyStack(this.keys, s);
    for (let i = 0; i < keyStack.getKeyTop(); i++) {
      let reply = this.decompose(keyStack.getKey(i), s);
      while (reply) {
        //  If decomposition returned gotoKey, try it
        if (reply instanceof GotoKey) {
          const gotoKey = reply;
          reply = this.decompose(gotoKey, s);
          continue;
        }
        return reply;
      }
    }

    return null;
  }

  /**
   * Decompose a string according to the given key.
   * Try each decomposition rule in order.
   * If it matches, assemble a mentionTokenized and return it.
   * If assembly fails, try another decomposition rule.
   * If assembly is a goto rule, return null and give the key.
   * If assembly succeeds, return the mentionTokenized.
   */
  private decompose(key: Key, s: string) {
    for (const decomposition of (key.getDecomp() || [])) {
      const mentionTokenized = mention
        .matchDecomposition(this.synonyms, s, decomposition.getPattern());
      if (mentionTokenized) {
        const rep = this.assemble(decomposition, mentionTokenized);
        if (!rep) {
          continue;
        }
        if (rep instanceof GotoKey) {
          if (rep.getKey()) {
            return rep;
          }
        } else {
          return rep;
        }
      }
    }

    return null;
  }

  /**
   * Assembly a reply from a decomp rule and the input.
   * If the reassembly rule is goto, return null and give
   *   the gotoKey to use.
   * Otherwise return the response.
   */
  private assemble(d: Decomp, reply: string[]) {
    let rule = d.nextRule();
    do {
      const lines = estring.match(rule, 'goto *');
      if (lines) {
        const gotoKey = this.keys.find(k => k.getKey() === lines[0]);
        //  goto rule -- set gotoKey and return false.
        if (gotoKey && gotoKey.getKey()) {
          return new GotoKey(gotoKey);
        }
        throw new GotoLostException(rule);
      }
    } while (0);
    let work = '';
    do {
      const lines = estring.match(rule, '* (#)*');
      if (!lines) {
        break;
      }
      //  reassembly rule with number substitution
      rule = lines[2];        // there might be more
      const n = parseInt(lines[1], 10) - 1;
      if (isNaN(n)) {
        throw new UnexpectedNumberException(lines[1], 'reassembly');
      }
      if (n < 0 || n > reply.length) {
        console.error(`Substitution number is bad ${lines[1]}`);
        return null;
      }
      reply[n] = PrePostUtil.translate(this.postList, reply[n]);
      work += `${lines[0]} ${reply[n]}`;
    } while (true);
    work += rule;
    if (d.isMemoryKey()) {
      this.mem.push(work);

      return null;
    }

    return work;
  }
}
