import { ScriptInterpretingError } from './base-error';

export class NoMentionDefException extends ScriptInterpretingError {
  constructor(problemTag: string) {
    super(`Could not fnd syn list for [${problemTag}]`);
  }
}
