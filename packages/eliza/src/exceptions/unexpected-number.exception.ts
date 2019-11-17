import { ScriptInterpretingError } from './base-error';

const message: {
  [ruleType: string]: string,
} = {
  key: 'key',
  reassembly: 'a reassembly rule',
};

export class UnexpectedNumberException extends ScriptInterpretingError {
  constructor(problemStr: string, ruleType: 'key' | 'reassembly') {
    super(`Number is wrong in ${message[ruleType]}: ${problemStr}`);
  }
}
