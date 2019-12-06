import { Observable, of, concat } from 'rxjs';
import { scan, tap, concatMap, filter } from 'rxjs/operators';
import { Decomp } from './decompo';
import { Reassemble } from './Reassemble';
import * as estring from './estring';
import * as mention from './mention-router';
import {
  PrePost, MentionRoute, Word, ReassembleContext, DecomposedSlot,
} from './interfaces';
import { Key } from './key';
import { GotoKey } from './key-goto';
import { buildKeyStack } from './key-stack';
import * as PrePostUtil from './pre-post-utils';
import * as printers from './printers';
import { notEmpty } from './utils';
import {
  UnexpectedNumberException, UnknownRuleException, GotoLostException,
  ScriptInterpretingError, DuplicateAnnotateException,
} from './exceptions';

const printSynonyms = true;
const printKeys = true;
const PRINT_PRE_POST = true;
const PRINT_INITIAL_FINAL = true;

export interface Eliza {
  getInitialStr(): string;
  isFinished(): boolean;
  toJson(): void;
  processInput(s: string): ReassembleContext | null;
  processHyperInput(s: string): ReassembleContext | null;
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
  private annotates: string[] = [];
  // TODO: should be treated as token translate in postList
  // for which, template should be easy to delimit number places
  private tweakList: PrePost[] = [];
  private initialStr = 'Hello.';
  private finalStr = 'Goodbye.';
  private quitList: Word[] = [];
  private lastDecomp: Decomp[] = [];
  private lastReasemb: Reassemble[] | null = [];

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
        tryMatch: (testStr: string) => estring.match(testStr, '*reasmb: *'),
        onMatched: (matchedParts: string[]) => {
          if (!this.lastReasemb) {
            throw new ScriptInterpretingError('A Reasmb rule missing decomp rule');
          }
          this.lastReasemb.push(new Reassemble(
            matchedParts[1], this.lastDecomp[this.lastDecomp.length - 1]));
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*decomp: *'),
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
        tryMatch: (testStr: string) => estring.match(testStr, '*key: * #*'),
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
        tryMatch: (testStr: string) => estring.match(testStr, '*key: *'),
        onMatched: (matchedParts: string[]) => {
          this.lastDecomp = [];
          this.lastReasemb = null;
          this.keys.push(new Key(matchedParts[1], 0, this.lastDecomp));
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*mention: *@* *'),
        onMatched: (matchedParts: string[]) => {
          const words = JSON.parse(`[${matchedParts[3]}]`);
          this.synonyms.push({
            tag: matchedParts[2],
            words: words.slice(1),
          });
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*annotate: *'),
        onMatched: (matchedParts: string[]) => {
          const tag = matchedParts[1].trim();
          if (tag.length < 1 || this.annotates.find(w => w === tag)) {
            throw new DuplicateAnnotateException(tag);
          }
          this.annotates.push(tag);
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*pre: * => *'),
        onMatched: (matchedParts: string[]) => {
          this.preList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*post: * => *'),
        onMatched: (matchedParts: string[]) => {
          this.postList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*tweak: * => *'),
        onMatched: (matchedParts: string[]) => {
          this.tweakList.push({ src: JSON.parse(matchedParts[1]), dest: JSON.parse(matchedParts[2]) });
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*initial: *'),
        onMatched: (matchedParts: string[]) => {
          this.initialStr = matchedParts[1];
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*final: *'),
        onMatched: (matchedParts: string[]) => {
          this.finalStr = matchedParts[1];
        },
      },
      {
        tryMatch: (testStr: string) => estring.match(testStr, '*quit: *'),
        onMatched: (matchedParts: string[]) => {
          this.quitList.push(` ${matchedParts[1]} `);
        },
      },
      {
        tryMatch: (testStr: string) => {
          const parts = estring.match(testStr, '*: *');
          if (parts && this.annotates.indexOf(estring.trim(parts[0])) > -1) {
            return parts;
          }
          return null;
        },
        onMatched: (matchedParts: string[]) => {
          const instruction = estring.trim(matchedParts[0]);
          if (!this.lastReasemb) {
            throw new ScriptInterpretingError(
              'An annotated Reasmb rule missing decomp rule');
          }
          this.lastReasemb.push(new Reassemble(
            matchedParts[1], this.lastDecomp[this.lastDecomp.length - 1], instruction));
        },
      },
    ].find(({ tryMatch, onMatched }) => {
      const matchedParts = tryMatch(s);
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

  public processHyperInput(s: string) {
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
    if (m) {
      return { assembled: { reassembled: m } };
    }
    //  No memory, reply with xnone.
    const key = this.keys.find(k => k.getKey() === 'xnone');
    if (key) {
      const context = this.fullyDecompose(key, s);
      if (context && context.assembled) {
        return context;
      }
    }

    //  No xnone, just return null.
    return null;
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
    return this.processHyperInput(s);
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
  private sentence(s: string): ReassembleContext | null {
    s = PrePostUtil.translate(this.preList, s);
    s = estring.pad(s);
    if (this.quitList.indexOf(s) >= 0) {
      this.finished = true;

      return { assembled: { reassembled: this.finalStr } };
    }
    if (this.tokenizer) {
      let result: ReassembleContext | null = null;
      return buildKeyStack(this.keys, this.tokenizer(s))
        .find(key => {
          const ctx = this.fullyDecompose(key, s);
          if (ctx) {
            result = ctx;
            return true;
          }
          return false;
        }) ? result : null;
    }
    const sortedReplyContexts =
      this.keys.map(key => this.fullyDecompose(key, s))
        .filter(notEmpty).sort(
          (ctxA, ctxB) =>
            (ctxA.matches ||
              { slottedTokens: [{ token: s, scopes: {} } as DecomposedSlot] })
              .slottedTokens.filter(t => Object.keys(t.scopes).length < 1)
              .map(t => t.token).join('').length
            - (ctxB.matches ||
              { slottedTokens: [{ token: s, scopes: {} } as DecomposedSlot] })
              .slottedTokens.filter(t => Object.keys(t.scopes).length < 1)
              .map(t => t.token).join('').length);
    return sortedReplyContexts[0] || null;
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
    const ASSEMBLE_FUNC = this.assemble;
    return (key.getDecomp() || []).map(decomposition => {
      const matches = mention.matchDecomposition(this.synonyms, s, decomposition.getPattern());
      if (!matches) {
        return null;
      }
      return {
        decomposition, matches,
        assembled: null as ReturnType<typeof ASSEMBLE_FUNC>,
      };
    }).filter(notEmpty).find(ctx => {
      ctx.assembled = this.assemble(ctx.decomposition, ctx.matches.slottedTokens);
      if (!ctx.assembled) {
        return false;
      }
      if (ctx.assembled instanceof GotoKey) {
        if (ctx.assembled.getKey()) {
          return true;
        }
      } else {
        return true;
      }
      return false;
    }) || null;
  }

  private fullyDecompose(key: Key, s: string): ReassembleContext | null {
    let decomposeCtx = this.decompose(key, s);
    while (decomposeCtx) {
      // If decomposition returned gotoKey, try it
      if (decomposeCtx.assembled instanceof GotoKey) {
        const gotoKey = decomposeCtx.assembled;
        decomposeCtx = this.decompose(gotoKey, s);
        continue;
      }
      if (!decomposeCtx.assembled) {
        return null;
      }
      const assembledResult = decomposeCtx.assembled;
      assembledResult.reassembled = PrePostUtil
        .translate(this.tweakList, assembledResult.reassembled);
      Object.keys(assembledResult.annotations).forEach(k => {
        assembledResult.annotations[k] = PrePostUtil
          .translate(this.tweakList, assembledResult.annotations[k]);
      });
      return {
        decomposition: decomposeCtx.decomposition,
        matches: decomposeCtx.matches,
        assembled: assembledResult,
      };
    }
    return null;
  }

  /**
   * Assembly a decomposedTokens from a decomp ruleTemplate and the input.
   * If the reassembly ruleTemplate is goto, return null and give
   *   the gotoKey to use.
   * Otherwise return the response.
   */
  private assemble(d: Decomp, decomposedSlots: DecomposedSlot[]): {
    reassembled: string,
    annotations: {
      [annotate: string]: string,
    },
  } | GotoKey | null {
    const decomposedTokens = decomposedSlots.map(s => s.token);
    const rule = d.nextRule();
    const assembledResult = rule.assemble(
      decomposedTokens.map(token => PrePostUtil.translate(this.postList, token)));
    if (assembledResult.gotoKey && assembledResult.gotoKey.length > 0) {
      const gotoKey = this.keys.find(k => k.getKey() === assembledResult.gotoKey);
      //  goto ruleTemplate -- set gotoKey and return false.
      if (gotoKey && gotoKey.getKey()) {
        return new GotoKey(gotoKey);
      }
      throw new GotoLostException(rule.getTemplate());
    }
    if (!assembledResult.result) {
      return null;
    }
    if (d.isMemoryKey()) {
      this.mem.push(assembledResult.result);
      return null;
    }
    return {
      reassembled: assembledResult.result,
      annotations: d.getAnnotates()
        .map(annotate => annotate.assemble(decomposedTokens))
        .reduce((reduced, current) => {
          if (current.annotation) {
            reduced[current.annotation] = current.result + '';
          }
          return reduced;
        }, {} as { [an: string]: string }),
    };

  }
}
