import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { loadEliza, Eliza } from 'eliza-core';
import ELIZA_SCRIPT from 'raw-loader!eliza-util/src/eliza.script';

@Injectable({
  providedIn: 'root'
})
export class ElizaBasicService {

  private lastEliza?: Eliza;

  constructor() { }

  async createEliza() {
    this.lastEliza = await loadEliza(of(ELIZA_SCRIPT));
    return this.lastEliza;
  }
}
