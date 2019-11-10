import * as fs from 'fs';
import _ from 'lodash';
import { Decomp } from './decompo';
import * as estring from './estring';
import * as mention from './mention-router';
import { PrePost, Reasemb, MentionRoute, Word } from './interfaces';
import { Key, createGotoKey } from './key';
import { KeyStack, buildKeyStack } from './key-stack';
import * as PrePostUtil from './pre-post-utils';
import * as printers from './printers';
import { UnexpectedNumberException } from './exceptions';

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

export function loadEliza(script?: 'eliza.script'): Eliza {
  const eliza = new ElizaImpl();
  eliza.readScript(script || 'eliza.script');
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
  private keyStack: KeyStack = new KeyStack();
  private lastDecomp: Decomp[] = [];
  private lastReasemb: Reasemb[] | null = [];

  /* Flag whether finished */
  private finished = false;

  constructor() {
    // Empty Construcgtor
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
          if (_.isNull(this.lastReasemb)) {
            return console.error('Error: no last reasemb');
          }
          this.lastReasemb.push(matchedParts[1]);
        },
      },
      {
        pattern: '*decomp: *',
        onMatched: (matchedParts: string[]) => {
          if (_.isNull(this.lastDecomp)) {
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
            if (_.isNaN(n)) {
              throw new UnexpectedNumberException(matchedParts[2]);
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
    ].find(matcher => {
      const matchedParts = estring.match(s, matcher.pattern);
      if (matchedParts) {
        matcher.onMatched(matchedParts);
        return matcher;
      }
    });
    if (!matchedPattern) {
      console.error(`Unrecognized Input: ${s}`);
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
    s = estring.translate(s,
      'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz');
    s = estring.translate(s,
      '@#$%^&*()_-+=~`{[}]|:;<>\\"', '                          ');
    s = estring.translate(s, ',?!', '...');
    //  Compress out multiple speace.
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
      const reply = this.decompose(key, s, createGotoKey());
      if (reply != null) { return reply; }
    }

    //  No xnone, just say anything.
    return 'I am at a loss for words.';
  }

  /**
   * readScript
   */
  public readScript(script: string) {
    const lines = fs.readFileSync(script, 'utf8').split('\n');
    if (lines.length < 1) {
      throw new Error('Cannot load Eliza Script!');
    }
    lines.filter(line => line.trim().length > 0 && !line.startsWith('%'))
      .forEach(line => this.collect(line));

    return true;
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
    buildKeyStack(this.keys, this.keyStack, s);
    for (let i = 0; i < this.keyStack.getKeyTop(); i++) {
      const gotoKey = createGotoKey();
      do {
        const reply = this.decompose(this.keyStack.getKey(i), s, gotoKey);
        if (reply) { return reply; }
      } while (0);
      //  If decomposition returned gotoKey, try it
      while (gotoKey.getKey()) {
        const reply = this.decompose(gotoKey, s, gotoKey);
        if (reply) { return reply; }
      }
    }

    return null;
  }

  /**
   * Decompose a string according to the given key.
   * Try each decomposition rule in order.
   * If it matches, assemble a reply and return it.
   * If assembly fails, try another decomposition rule.
   * If assembly is a goto rule, return null and give the key.
   * If assembly succeeds, return the reply.
   */
  private decompose(key: Key, s: string, gotoKey: Key) {
    for (const decomp of (key.getDecomp() || [])) {
      const reply = mention.matchDecomposition(this.synonyms, s, decomp.getPattern());
      if (reply) {
        const rep = this.assemble(decomp, reply, gotoKey);
        if (rep) {
          return rep;
        }
        if (gotoKey.getKey()) {
          return null;
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
  private assemble(d: Decomp, reply: string[], gotoKey: Key) {
    let rule = d.nextRule();
    do {
      const lines = estring.match(rule, 'goto *');
      if (lines) {
        const keyToSet = this.keys.find(k => k.getKey() === lines[0]);
        //  goto rule -- set gotoKey and return false.
        if (!keyToSet || !keyToSet.getKey()) {
          console.warn(`Unexpected?: Goto rule did not match key: ${lines[0]}`);
          return null;
        }
        gotoKey.copy(keyToSet);
        return null;
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
      let n = parseInt(lines[1], 10) - 1;
      if (isNaN(n)) {
        console.error(`Number is wrong in reassembly rule ${lines[1]}`);
        n = 0;
      }
      if (n < 0 || n > reply.length) {
        console.error(`Substitution number is bad ${lines[1]}`);
        return null;
      }
      reply[n] = PrePostUtil.translate(this.postList, reply[n]);
      work += `${lines[0]} ${reply[n]}`;
    } while (true);
    work += rule;
    if (d.isAware()) {
      this.mem.push(work);

      return null;
    }

    return work;
  }
}
