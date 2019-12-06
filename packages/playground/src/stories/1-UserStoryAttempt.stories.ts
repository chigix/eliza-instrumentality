import { storiesOf, moduleMetadata } from '@storybook/angular';
import { Component, OnInit, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Eliza, getAssembledReply, getAssembledContext } from 'eliza-core';

import { ElizaBasicService } from 'src/app/core/eliza-basic.service';
import {
  ChattingRecord, ChatRoomUiModule, MessageListComponent, InputSpaceComponent,
} from 'src/app/features/chat-room-ui';

import { UserStory } from './1-interfaces';

function normalizeAnnotations(annotations: { [annotate: string]: string }) {
  return {
    userStoryA: annotations.userStoryA || undefined,
    userStoryB: annotations.userStoryB || undefined,
    aIsDependencyOfB: annotations.aIsDependencyOfB ?
      (annotations.aIsDependencyOfB === 'true') : undefined,
    aHasPurposeB: annotations.aHasPurposeB ?
      (annotations.aHasPurposeB === 'true') : undefined,
    bIsDependencyOfA: annotations.bIsDependencyOfA ?
      (annotations.bIsDependencyOfA === 'true') : undefined,
    bHasPurposeA: annotations.bHasPurposeA ?
      (annotations.bHasPurposeA === 'true') : undefined,
    replyYes: annotations.replyYes ?
      (annotations.replyYes === 'true') : undefined,
    replyNo: annotations.replyNo ?
      (annotations.replyNo === 'true') : undefined,
  };
}

@Component({
  selector: 'app-sb-message-list',
  template:
    '<app-message-list></app-message-list>'
    + '<app-input-space (messageSent)="processInput($event)"></app-input-space>',
})
export class USGBotStoryComponent implements OnInit {

  private userStoryGraphDB: UserStory[] = [];
  private pendingConfirm?: (annotate: { replyYes?: boolean, replyNo?: boolean }) => void;

  @ViewChild(MessageListComponent, { static: true })
  private readonly msgListComp!: MessageListComponent;

  @ViewChild(InputSpaceComponent, { static: true })
  private readonly inputComp!: InputSpaceComponent;

  private elizaInstance?: Eliza;

  constructor(
    private readonly elizaService: ElizaBasicService,
  ) { }

  async ngOnInit() {
    this.msgListComp.pushMessage(new ChattingRecord({
      text: 'こんにちは、これからは何をしますか？', fromUserInput: false,
    }));
    this.elizaInstance = await this.elizaService.createEliza('user-story');
  }

  processInput(userInput: ChattingRecord) {
    this.inputComp.clearInput();
    this.msgListComp.pushMessage(userInput);
    if (!this.elizaInstance) { return; }
    if (userInput.getRawText() === 'reset') {
      this.userStoryGraphDB = [];
      this.msgListComp.clearMessageList();
      return;
    }
    const processedInput = getAssembledContext(this.elizaInstance.processInput(userInput.getRawText()));
    if (!processedInput) {
      return this.msgListComp.pushMessage(new ChattingRecord({
        text: 'システムが落ちちゃいました', fromUserInput: false,
      }));
    }
    const annotations = normalizeAnnotations(processedInput.annotations);
    if ((annotations.replyYes || annotations.replyNo) && this.pendingConfirm) {
      return this.pendingConfirm(annotations);
    }
    console.log(userInput.getRawText(), annotations);
    const extractingUserStories: UserStory[] = [];
    if (annotations.userStoryA) {
      extractingUserStories.push({
        rawMessages: [annotations.userStoryA],
        number: this.userStoryGraphDB.length,
        links: [],
      });
    }
    if (annotations.userStoryB) {
      extractingUserStories.push({
        rawMessages: [annotations.userStoryB],
        number: this.userStoryGraphDB.length,
        links: [],
      });
    }
    this.userStoryGraphDB.forEach(us => {
      extractingUserStories.forEach(ele => {
        us.links.push({
          userStory: ele,
        });
      });
    });
    extractingUserStories.forEach(ele => {
      this.userStoryGraphDB.forEach(us => {
        ele.links.push({
          userStory: us,
        });
      });
    });
    this.userStoryGraphDB.push(...extractingUserStories);
    if (extractingUserStories.length === 2) {
      if (annotations.aHasPurposeB) {
        (extractingUserStories[0].links
          .find(l => l.userStory === extractingUserStories[1])
          || { hasPurposeTo: false }).hasPurposeTo = true;
      }
      if (annotations.aIsDependencyOfB) {
        (extractingUserStories[0].links
          .find(l => l.userStory === extractingUserStories[1])
          || { isDependencyOf: false }).isDependencyOf = true;
      }
      if (annotations.bHasPurposeA) {
        (extractingUserStories[1].links
          .find(l => l.userStory === extractingUserStories[0])
          || { hasPurposeTo: false }).hasPurposeTo = true;
      }
      if (annotations.bIsDependencyOfA) {
        (extractingUserStories[1].links
          .find(l => l.userStory === extractingUserStories[0])
          || { isDependencyOf: false }).isDependencyOf = true;
      }
    }
    for (const us of this.userStoryGraphDB) {
      for (const link of us.links) {
        if (link.hasPurposeTo === undefined) {
          return this.msgListComp.pushMessage(new ChattingRecord({
            text: getAssembledReply(this.elizaInstance.processHyperInput(
              `@confirm-clarification: ${us.rawMessages[0]} => ${link.userStory.rawMessages[0]}`),
              '僕疲れました。'),
            fromUserInput: false,
          }));
        }
        if (link.isDependencyOf === undefined) {
          return this.msgListComp.pushMessage(new ChattingRecord({
            text: getAssembledReply(this.elizaInstance.processHyperInput(
              `@confirm-dependency: ${us.rawMessages[0]} => ${link.userStory.rawMessages[0]}`),
              '僕疲れました。'),
            fromUserInput: false,
          }));
        }
      }
    }
    return this.msgListComp.pushMessage(new ChattingRecord({
      text: getAssembledReply(
        this.elizaInstance.processHyperInput(`@request-user-story`), '僕疲れました。'),
      fromUserInput: false,
    }));
  }

}

storiesOf('Attempt in User Story', module)
  .addDecorator(
    moduleMetadata({
      imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        MatButtonModule,
        ChatRoomUiModule,
      ],
      declarations: [USGBotStoryComponent],
    })
  ).add('User Story Test', () => {
    return {
      template: `<app-sb-message-list></app-sb-message-list>`,
    };
  });
