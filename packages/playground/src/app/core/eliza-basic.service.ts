import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { loadEliza, Eliza, loadElizaInEnglish } from 'eliza-core';
import ELIZA_SCRIPT from 'raw-loader!eliza-util/src/eliza.script';
import ELIZA_SCRIPT_JP from 'raw-loader!eliza-jp/dist/eliza.ipadic.script';
import USER_STORY_SCRIPT from 'raw-loader!eliza-jp/dist/user-story-composer.script';

@Injectable({
  providedIn: 'root'
})
export class ElizaBasicService {

  private lastEliza?: Eliza;

  constructor() { }

  async createEliza(script: 'eliza-en' | 'eliza-jp' | 'user-story') {
    switch (script) {
      case 'eliza-en':
        this.lastEliza = await loadElizaInEnglish(of(ELIZA_SCRIPT));
        break;
      case 'eliza-jp':
        this.lastEliza = await loadEliza(of(ELIZA_SCRIPT_JP));
        break;
      case 'user-story':
        this.lastEliza = await loadEliza(of(USER_STORY_SCRIPT));
        break;

      default:
        throw new Error('Unknown script');
    }
    return this.lastEliza;
  }
}
