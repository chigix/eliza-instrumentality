import { storiesOf, moduleMetadata } from '@storybook/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Eliza } from 'eliza-core';

import { ElizaBasicService } from 'src/app/core/eliza-basic.service';
import { ChattingRecord } from '../chatting-record';
import { ChatRoomUiModule, MessageListComponent, InputSpaceComponent } from '../';

const ELIZA_TEST_SCRIPT = [
  'Men are all alike.',
  'They\'re always debugging us about something or other.',
  'Well, my boyfriend made me come here.',
  'He says I\'m depressed much of the time.',
  'It\'s true. I am unhappy.',
  'I need some help, that much seems certain.',
  'Perhaps I could learn to get along with my mother.',
  'My mother takes care of me.',
  'My father.',
  'You are like my father in some ways.',
  'You are not very aggressive but I think you don\'t want me to notice that.',
  'You don\'t argue with me.',
  'You are afraid of me.',
  'My father is afraid of everybody.',
  'Bullies.',
];

@Component({
  selector: 'app-sb-message-list',
  template:
    '<button mat-raised-button (click)="runNewEliza()">ELIZA TEST</button>'
    + '<app-message-list></app-message-list>'
    + '<app-input-space (messageSent)="processInput($event)"></app-input-space>',
})
export class ChatBoxStoryComponent implements OnInit {

  @ViewChild(MessageListComponent, { static: true })
  private readonly msgListComp!: MessageListComponent;

  @ViewChild(InputSpaceComponent, { static: true })
  private readonly inputComp!: InputSpaceComponent;

  private elizaInstance?: Eliza;

  constructor(
    private readonly elizaService: ElizaBasicService,
  ) { }

  async ngOnInit() {
    this.elizaInstance = await this.elizaService.createEliza('eliza-en');
  }

  processInput(userInput: ChattingRecord) {
    if (this.elizaInstance) {
      this.inputComp.clearInput();
      this.msgListComp.pushMessage(userInput);
      this.msgListComp.pushMessage(new ChattingRecord({
        text: this.elizaInstance.processInput(userInput.getRawText()), fromUserInput: false,
      }));
    }
  }

  async runNewEliza() {
    if (!this.elizaInstance) {
      return;
    }
    const eliza = this.elizaInstance;
    ELIZA_TEST_SCRIPT.forEach(message => {
      this.msgListComp.pushMessage(new ChattingRecord({
        text: message, fromUserInput: true,
      }));
      this.msgListComp.pushMessage(new ChattingRecord({
        text: eliza.processInput(message), fromUserInput: false,
      }));
    });
  }

}

storiesOf('ChatboxComponent', module)
  .addDecorator(
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        ChatRoomUiModule,
      ],
      declarations: [ChatBoxStoryComponent],
    })
  ).add('Eliza Test', () => {
    return {
      template: `<app-sb-message-list></app-sb-message-list>`,
    };
  });
