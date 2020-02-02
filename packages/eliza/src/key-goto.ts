import { Key } from './key';

export class GotoKey extends Key {

  constructor(dest: Key) {
    super(dest.getKey(), dest.getRank(), dest.getDecomp());
  }

}
