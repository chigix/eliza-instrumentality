import { ScriptInterpretingError } from './base-error';

export class UnexpectedNumberException extends ScriptInterpretingError {
  constructor(problemStr: string) {
    super(`Number is wrong in key: ${problemStr}`);
  }
}
