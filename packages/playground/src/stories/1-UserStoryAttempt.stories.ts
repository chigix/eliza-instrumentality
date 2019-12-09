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

import { UserStory, LabeledTerms } from './1-interfaces';
import { noop } from './utils';

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

function normalizeTokenAnnotations(annotations: { [annotate: string]: string }) {
  const normalized: LabeledTerms = {
    leftPawns: '', knights: [], rooks: [], aims: [], pawns: [],
  };
  if (annotations.termKing) {
    normalized.king = annotations.termKing;
  }
  if (annotations.termPawns) {
    normalized.leftPawns = annotations.termPawns;
  }
  if (annotations.aims) {
    normalized.aims.push(annotations.aims);
  }
  if (annotations.termPawnLeft) {
    normalized.pawns.push(annotations.termPawnLeft);
  }
  if (annotations.termKnight) {
    normalized.knights.push(annotations.termKnight);
  }
  return normalized;
}

function makeReplyYesNoHandler(
  ifYes: () => void,
  ifNo: () => void,
  ifUserStory: (userStory: UserStory) => void,
  other: () => void) {
  return (annotate: { replyYes?: boolean, replyNo?: boolean, userStoryA?: UserStory }) => {
    if (annotate.replyYes) {
      return ifYes();
    }
    if (annotate.replyNo) {
      return ifNo();
    }
    if (annotate.userStoryA) {
      return ifUserStory(annotate.userStoryA);
    }
    return other();
  };
}

function searchMissingLink(userStoryGraphDB: UserStory[], eliza: Eliza) {
  // Scan missing links
  for (const us of userStoryGraphDB) {
    for (const link of us.links) {
      if (link.hasPurposeTo === undefined) {
        return {
          pendingConfirm: makeReplyYesNoHandler(
            function ifYesReplied() { link.hasPurposeTo = 1; },
            function ifNoReplied() { link.hasPurposeTo = -1; },
            noop, noop),
          confirmMsg: new ChattingRecord({
            text: getAssembledReply(eliza.processHyperInput(
              `@confirm-clarification: ${us.rawMessages[0]} => ${link.userStory.rawMessages[0]}`),
              '僕疲れました。'),
            fromUserInput: false,
          }),
        };
      }
      if (link.isDependencyOf === undefined) {
        return {
          pendingConfirm: makeReplyYesNoHandler(
            function ifYesReplied() {
              link.isDependencyOf = 1;
              const reverse = link.userStory.links.find(l => l.userStory.number === us.number);
              if (reverse) {
                reverse.isDependencyOf = -1;
              }
            },
            function ifNoReplied() { link.isDependencyOf = -1; },
            noop, noop),
          confirmMsg: new ChattingRecord({
            text: getAssembledReply(eliza.processHyperInput(
              `@confirm-dependency: ${us.rawMessages[0]} => ${link.userStory.rawMessages[0]}`),
              '僕疲れました。'),
            fromUserInput: false,
          }),
        };
      }
    }
  }
  return null;
}

function removeUserStory(userStoryGraphDB: UserStory[], toRemove: UserStory) {
  const shiftedUserStories: UserStory[] = [];
  while (true) {
    const toCheck = userStoryGraphDB.shift();
    if (!toCheck) {
      break;
    }
    if (toCheck.number !== toRemove.number) {
      shiftedUserStories.push(toCheck);
    }
    toCheck.links = toCheck.links.filter(l => l.userStory.number !== toRemove.number);
  }
  shiftedUserStories.forEach(us => userStoryGraphDB.push());
}

function searchSimilarUserStory(userStoryDb: UserStory[], search: UserStory, delimiter: Eliza, weighter: Eliza) {
  function getFeatures(us: UserStory) {
    return us.rawMessages.map(msg => {
      let assembled = getAssembledContext(delimiter.processHyperInput(`@semantic-capture: ${msg}`));
      if (!assembled) {
        return null;
      }
      const toReturn = normalizeTokenAnnotations(assembled.annotations);
      do {
        if (toReturn.leftPawns.length < 1 || !assembled) {
          return toReturn;
        }
        const update = normalizeTokenAnnotations(assembled.annotations);
        toReturn.leftPawns = update.leftPawns;
        toReturn.pawns = toReturn.pawns.concat(update.pawns);
        toReturn.knights = toReturn.knights.concat(update.knights);
        assembled = getAssembledContext(weighter.processHyperInput(`@select-pawns: ${toReturn.leftPawns}`));
      } while (true);
    }).reduce((reduced, terms) => {
      if (!terms || !reduced) {
        return reduced;
      }
      if (terms.king) {
        reduced.king = terms.king;
      }
      reduced.aims = reduced.aims.concat(terms.aims);
      reduced.knights = reduced.knights.concat(terms.knights);
      reduced.pawns = reduced.pawns.concat(terms.pawns);
      return reduced;
    }, {
      aims: [] as string[],
      knights: [] as string[],
      pawns: [] as string[],
    } as LabeledTerms);
  }
  const toCompare = userStoryDb
    .filter(us => us.number !== search.number).map(userStory => ({
      userStory, features: getFeatures(userStory) as LabeledTerms,
    })).filter(labeled => !!labeled.features);
  if (toCompare.length < 1) {
    return null;
  }
  return toCompare.map(labeledUserStory => {
    const weighted: { [key: string]: number } = {};
    if (labeledUserStory.features.king) {
      weighted[labeledUserStory.features.king] = 100;
    }
    labeledUserStory.features.aims.forEach(t => weighted[t] = (weighted[t] || 0) + 20);
    labeledUserStory.features.knights.forEach(t => weighted[t] = (weighted[t] || 0) + 10);
    labeledUserStory.features.pawns.forEach(t => weighted[t] = (weighted[t] || 0) + 2);
    const total = Object.keys(weighted).map(k => weighted[k]).reduce((r, c) => r + c, 0);
    Object.keys(weighted).forEach(k => weighted[k] = weighted[k] / total);
    return { ...labeledUserStory, weighted };
  }).map(labeledUserStory => {
    return {
      userStory: labeledUserStory.userStory,
      similarity: Object.keys(labeledUserStory.weighted)
        .map(t => search.rawMessages[0].indexOf(t) > -1 ? labeledUserStory.weighted[t] : 0)
        .reduce((r, c) => r + c, 0)
    };
  });
}

@Component({
  selector: 'app-sb-message-list',
  template:
    '<app-message-list></app-message-list>'
    + '<app-input-space (messageSent)="processInput($event)"></app-input-space>',
})
export class USGBotStoryComponent implements OnInit {

  private userStoryGraphDB: UserStory[] = [];
  private pendingConfirm?: ReturnType<typeof makeReplyYesNoHandler>;
  private recentUserStoryMention: UserStory[] = [];

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
    const USER_STORY_DB = this.userStoryGraphDB;
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
    if (processedInput.reassembled !== 'placeholder') {
      return this.msgListComp.pushMessage(new ChattingRecord({
        text: processedInput.reassembled, fromUserInput: false,
      }));
    }
    const annotations = normalizeAnnotations(processedInput.annotations);
    if ((annotations.replyYes || annotations.replyNo) && this.pendingConfirm) {
      this.pendingConfirm({ replyYes: annotations.replyYes, replyNo: annotations.replyNo });
      this.pendingConfirm = undefined;
    }
    console.log(userInput.getRawText(), annotations);
    const extractingUserStories: UserStory[] = [];
    if (annotations.userStoryA) {
      extractingUserStories.push({
        rawMessages: [annotations.userStoryA],
        number: this.userStoryGraphDB.length,
        links: [],
      });
      this.recentUserStoryMention = [];
    }
    if (annotations.userStoryB) {
      extractingUserStories.push({
        rawMessages: [annotations.userStoryB],
        number: this.userStoryGraphDB.length,
        links: [],
      });
      this.recentUserStoryMention = [];
    }
    this.userStoryGraphDB.push(...extractingUserStories);
    extractingUserStories.forEach(ele => {
      this.userStoryGraphDB.filter(us => us.number !== ele.number).forEach(us => {
        ele.links.push({ userStory: us });
        us.links.push({ userStory: ele });
      });
      this.recentUserStoryMention.push(ele);
    });
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
    if (extractingUserStories.length === 1 && this.pendingConfirm) {
      this.pendingConfirm({ userStoryA: extractingUserStories[0] });
    }
    do {
      const questionEquivalenceUserStory = this.recentUserStoryMention.shift();
      if (!questionEquivalenceUserStory) {
        break;
      }
      const r = (searchSimilarUserStory(this.userStoryGraphDB,
        questionEquivalenceUserStory, this.elizaInstance, this.elizaInstance) || [])
        .filter(search => search.similarity > 0.5).sort((a, b) => b.similarity - a.similarity);
      if (r.length > 0) {
        this.pendingConfirm = makeReplyYesNoHandler(
          function ifYesReplied() {
            r[0].userStory.rawMessages.push(questionEquivalenceUserStory.rawMessages[0]);
            removeUserStory(USER_STORY_DB, questionEquivalenceUserStory);
          },
          noop, noop, noop);
        return this.msgListComp.pushMessage(new ChattingRecord({
          text: getAssembledReply(
            this.elizaInstance.processHyperInput(
              `@confirm-equivalence: ${questionEquivalenceUserStory.rawMessages[0]} => ${r[0].userStory.rawMessages[0]}`),
            '僕疲れました。'), fromUserInput: false,
        }));
      }
    } while (0);
    const linkConfirmation = searchMissingLink(this.userStoryGraphDB, this.elizaInstance);
    if (linkConfirmation) {
      this.pendingConfirm = linkConfirmation.pendingConfirm;
      return this.msgListComp.pushMessage(linkConfirmation.confirmMsg);
    }
    if (extractingUserStories.length === 1) {
      this.pendingConfirm = makeReplyYesNoHandler(
        noop, noop, userStory => {
          const link = extractingUserStories[0].links.find(l => l.userStory.number === userStory.number);
          if (!link) {
            return;
          }
          link.hasPurposeTo = 1;
        }, noop,
      );
      return this.msgListComp.pushMessage(new ChattingRecord({
        text: getAssembledReply(
          this.elizaInstance.processHyperInput(
            `@request-purpose: ${extractingUserStories[0].rawMessages[0]}`), '僕疲れました。'),
        fromUserInput: false,
      }));
    }
    this.pendingConfirm = undefined;
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
