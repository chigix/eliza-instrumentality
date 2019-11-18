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
    const eliza = await service.createEliza();
    expect(eliza.getInitialStr()).toEqual('How do you do.  Please tell me your problem.');
  }));
});
