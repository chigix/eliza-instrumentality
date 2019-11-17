import { Key } from './key';

export class GotoKey extends Key {

  constructor(dest: Key) {
    super(null, 0, null);
    this.copy(dest);
  }

}
