import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ChattingRecord } from '../chatting-record';

@Component({
  selector: 'app-input-space',
  templateUrl: './input-space.component.html',
  styleUrls: ['./input-space.component.scss']
})
export class InputSpaceComponent implements OnInit {

  inputMsg = '';

  @Output() messageSent = new EventEmitter<ChattingRecord>();

  constructor() { }

  ngOnInit() {
  }

  sendInput() {
    this.messageSent.emit(new ChattingRecord({
      text: this.inputMsg,
      fromUserInput: true,
    }));
  }

  clearInput() {
    this.inputMsg = '';
  }

}
