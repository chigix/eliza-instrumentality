import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChattingRecord } from '../chatting-record';

@Component({
  selector: 'app-message-list',
  templateUrl: './message-list.component.html',
  styleUrls: ['./message-list.component.scss']
})
export class MessageListComponent implements OnInit {

  @Input() private chattingContext: ChattingRecord[] = [];

  // TODO: remove into a separated component responsible for user input
  @Output() private chattingContextChange = new EventEmitter();

  constructor() { }

  ngOnInit() { }

  pushMessage(message: ChattingRecord) {
    this.chattingContext.push(message);
  }

  clearMessageList() {
    while (this.chattingContext.shift()) {
    }
  }

}
