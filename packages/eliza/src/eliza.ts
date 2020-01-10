import { Observable, of, concat } from 'rxjs';
import { scan, tap, concatMap, filter } from 'rxjs/operators';
import { Decomp } from './decompo';
import * as estring from './estring';
import * as mention from './mention-router';
import {
  PrePost, Reasemb, MentionRoute, Word,
} from './interfaces';
import { Key } from './key';
import { GotoKey } from './key-goto';
import { buildKeyStack } from './key-stack';
import * as PrePostUtil from './pre-post-utils';
import * as printers from './printers';
import { notEmpty } from './utils';
import {
  UnexpectedNumberException, UnknownRuleException, GotoLostException,
  ScriptInterpretingError, InvalidStringException,
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

export async function loadElizaInEnglish(script$: Observable<string>): Promise<Eliza> {
  const eliza = new ElizaImpl(sentence => sentence.split(' '));
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
  private tweakList: PrePost[] = [];
  private initialStr = 'Hello.';
  private finalStr = 'Goodbye.';
  private quitList: Word[] = [];
  private lastDecomp: Decomp[] = [];
  private lastReasemb: Reasemb[] | null = [];

  /* Flag whether finished */
  private finished = false;

  constructor(
    private readonly tokenizer?: (sentence: string) => Word[],
  ) { }

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
            throw new ScriptInterpretingError('A Reasmb rule missing decomp rule');
          }
          this.lastReasemb.push(matchedParts[1]);
        },
      },
      {
        pattern: '*decomp: *',
        onMatched: (matchedParts: string[]) => {
          if (!this.lastDecomp) {
            throw new ScriptInterpretingError('A Decomp rule missing Key Initialization');
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
        pattern: '*mention: *@* *',
        onMatched: (matchedParts: string[]) => {
          const words = JSON.parse(`[${matchedParts[3]}]`);
          this.synonyms.push({
            tag: matchedParts[2],
            words: words.slice(1),
          });
        },
      },
      {
        pattern: '*pre: * => *',
        onMatched: (matchedParts: string[]) => {
          this.preList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
        },
      },
      {
        pattern: '*post: * => *',
        onMatched: (matchedParts: string[]) => {
          this.postList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
        },
      },
      {
        pattern: '*tweak: * => *',
        onMatched: (matchedParts: string[]) => {
          this.tweakList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
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
    if (typeof s !== 'string') {
      throw new InvalidStringException(s);
    }
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
      const context = this.decompose(key, s);
      if (context && context.strRep) { return context.strRep; }
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
    if (this.tokenizer) {
      let result: string = '';
      return buildKeyStack(this.keys, this.tokenizer(s))
        .find(key => {
          const ctx = this.fullyDecompose(key, s);
          if (ctx && ctx.strRep) {
            result = ctx.strRep;
            return true;
          }
          return false;
        }) ? result : null;
    }
    const sortedReplyContexts =
      this.keys.map(key => this.fullyDecompose(key, s))
        .filter(notEmpty).sort(
          (ctxA, ctxB) => ctxA.matches.slottedTokens.join('').length
            - ctxB.matches.slottedTokens.join('').length);
    const filteredContext = sortedReplyContexts[0];
    if (filteredContext && filteredContext.strRep) {
      return filteredContext.strRep;
    }
    return null;
  }

  /**
   * Decompose a string according to the given key.
   * Try each decomposition rule in order.
   * If it matches, assemble a ctx and return it.
   * If assembly fails, try another decomposition rule.
   * If assembly is a goto rule, return null and give the key.
   * If assembly succeeds, return the ctx.
   */
  private decompose(key: Key, s: string) {
    const f = this.assemble;
    type ASSEMBLE_RESULT = ReturnType<typeof f>;
    return (key.getDecomp() || []).map(decomposition => {
      const matches = mention.matchDecomposition(this.synonyms, s, decomposition.getPattern());
      if (!matches) {
        return null;
      }
      return {
        decomposition, matches,
        reply: null as ASSEMBLE_RESULT, strRep: null as string | null,
      };
    }).filter(notEmpty).find(ctx => {
      ctx.reply = this.assemble(ctx.decomposition, ctx.matches.slottedTokens);
      if (!ctx.reply) {
        return false;
      }
      if (ctx.reply instanceof GotoKey) {
        if (ctx.reply.getKey()) {
          return true;
        }
      } else {
        ctx.strRep = ctx.reply;
        return true;
      }
      return false;
    }) || null;
  }

  private fullyDecompose(key: Key, s: string) {
    let decomposeCtx = this.decompose(key, s);
    while (decomposeCtx) {
      // If decomposition returned gotoKey, try it
      if (decomposeCtx.reply instanceof GotoKey) {
        const gotoKey = decomposeCtx.reply;
        decomposeCtx = this.decompose(gotoKey, s);
        continue;
      }
      return decomposeCtx;
    }
    return null;
  }

  /**
   * Assembly a decomposedTokens from a decomp rule and the input.
   * If the reassembly rule is goto, return null and give
   *   the gotoKey to use.
   * Otherwise return the response.
   */
  private assemble(d: Decomp, decomposedTokens: string[]) {
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
      if (n < 0 || n > decomposedTokens.length) {
        throw new Error(
          `Fatal Error: Substitution number is bad ${lines[1]} in ${d.getPattern()}`);
      }
      const term = PrePostUtil.translate(this.postList, decomposedTokens[n]);
      work += `${lines[0]} ${term}`;
    } while (true);
    work += rule;
    if (d.isMemoryKey()) {
      this.mem.push(work);

      return null;
    }

    return PrePostUtil.translate(this.tweakList, work);
  }
}
