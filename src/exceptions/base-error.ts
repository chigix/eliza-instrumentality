export class ScriptInterpretingError extends Error {
  constructor(msg: string) {
    super(msg || 'ScriptInterpretingError');
  }
}
