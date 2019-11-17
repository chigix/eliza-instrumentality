import { ScriptInterpretingError } from './base-error';

export class UnknownRuleException extends ScriptInterpretingError {
  constructor(problemStr: string) {
    super(`Unknown Rule: ${problemStr}`);
  }
}
