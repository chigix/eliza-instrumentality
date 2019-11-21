import uniqueId from 'lodash/uniqueId';

export class ChattingRecord {

  private rawText: string;
  private fromMe: boolean;
  private readonly recordId = uniqueId();


  constructor(msg: {
    text: string,
    fromMe: boolean,
    // TODO: replace with a callback register further
    semanticPredicate?: string,
  }) {
    this.rawText = msg.text;
    this.fromMe = msg.fromMe;
  }

  getRawText() {
    return this.rawText;
  }

  isFromMe() {
    return this.fromMe;
  }

  getId() {
    return this.recordId;
  }

}
