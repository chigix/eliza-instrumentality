export class InvalidStringException extends Error {
  constructor(problemStr: string) {
    super(`Invalid String Given: ${problemStr}`);
  }
}
