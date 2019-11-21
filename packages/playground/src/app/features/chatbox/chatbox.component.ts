import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChattingRecord } from './chatting-record';

@Component({
  selector: 'app-chatbox',
  templateUrl: './chatbox.component.html',
  styleUrls: ['./chatbox.component.scss']
})
export class ChatboxComponent implements OnInit {

  @Input() private chattingContext: ChattingRecord[] = [];

  // TODO: remove into a separated component responsible for user input
  @Output() private chattingContextChange = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  pushMessage(message: ChattingRecord) {
    this.chattingContext.push(message);
  }

}
