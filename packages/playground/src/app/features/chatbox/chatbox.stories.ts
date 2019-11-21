import { storiesOf, moduleMetadata } from '@storybook/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

import { ChatboxModule } from './chatbox.module';
import { ElizaBasicService } from '../../core';
import { ChatboxComponent } from './chatbox.component';
import { ChattingRecord } from './chatting-record';

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
  selector: 'app-sb-chatbox',
  template:
    '<button mat-raised-button (click)="runNewEliza()">ELIZA TEST</button>'
    + '<app-chatbox></app-chatbox>',
})
export class ChatBoxStoryComponent implements OnInit {

  @ViewChild(ChatboxComponent, { static: true })
  private readonly chatboxComponent!: ChatboxComponent;

  notes = '';

  constructor(
    private readonly elizaService: ElizaBasicService,
  ) { }

  ngOnInit() {
    console.log(this.chatboxComponent);
  }

  async runNewEliza() {
    const eliza = await this.elizaService.createEliza();
    ELIZA_TEST_SCRIPT.forEach(message => {
      this.chatboxComponent.pushMessage(new ChattingRecord({
        text: message, fromMe: true,
      }));
      this.chatboxComponent.pushMessage(new ChattingRecord({
        text: eliza.processInput(message), fromMe: false,
      }));
    });
  }

}

storiesOf('ChatboxComponent', module)
  .addDecorator(
    moduleMetadata({
      imports: [
        MatButtonModule,
        ChatboxModule,
      ],
      declarations: [ChatBoxStoryComponent],
    })
  ).add('default', () => {
    return {
      template: `<app-sb-chatbox></app-sb-chatbox>`,
    };
  });
