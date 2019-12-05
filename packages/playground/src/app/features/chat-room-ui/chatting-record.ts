import uniqueId from 'lodash/uniqueId';

export class ChattingRecord {

  private rawText: string;
  private fromUserInput: boolean;
  private readonly recordId = uniqueId();


  constructor(msg: {
    text: string,
    fromUserInput: boolean,
    // TODO: replace with a callback register further
    semanticPredicate?: string,
  }) {
    this.rawText = msg.text;
    this.fromUserInput = msg.fromUserInput;
  }

  getRawText() {
    return this.rawText;
  }

  isFromMe() {
    return this.fromUserInput;
  }

  getId() {
    return this.recordId;
  }

}
