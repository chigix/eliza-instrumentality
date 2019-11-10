import { ScriptInterpretingError } from './base-error';

export class NoReassemblyRuleException extends ScriptInterpretingError {
  constructor() {
    super('No reassembly rule.');
  }
}
