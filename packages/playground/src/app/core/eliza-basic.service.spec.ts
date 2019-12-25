import * as fs from 'fs';
import { SCRIPT_PATH } from 'eliza-util';
jest.mock(`raw-loader!eliza-util/src/eliza.script`,
  () => fs.readFileSync(SCRIPT_PATH + '/eliza.script', 'utf8'), { virtual: true });

import { TestBed, async } from '@angular/core/testing';

import { ElizaBasicService } from './eliza-basic.service';

describe('ElizaBasicService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ElizaBasicService = TestBed.get(ElizaBasicService);
    expect(service).toBeTruthy();
  });

  it('should create an Eliza instance', async(async () => {
    const service: ElizaBasicService = TestBed.get(ElizaBasicService);
    const eliza = await service.createEliza('eliza-en');
    expect(eliza.getInitialStr()).toEqual('How do you do.  Please tell me your problem.');
  }));
});
