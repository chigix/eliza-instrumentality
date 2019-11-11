import { ScriptInterpretingError } from './base-error';

export class GotoLostException extends ScriptInterpretingError {
  constructor(gotoRule: string) {
    super(`The destination of goto could not found: ${gotoRule}`);
  }
}
