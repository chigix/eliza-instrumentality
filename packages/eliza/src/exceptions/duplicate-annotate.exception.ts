import { ScriptInterpretingError } from './base-error';

export class DuplicateAnnotateException extends ScriptInterpretingError {
  constructor(annotate: string) {
    super(`Annotate Duplicated: ${annotate}`);
  }
}
