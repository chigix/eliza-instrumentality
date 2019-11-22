import { storiesOf, moduleMetadata } from '@storybook/angular';
const simpleMd = require('simple-markdown');

import { Component, OnInit } from '@angular/core';
import WELCOME_MD from './0-Welcome.md';

@Component({
  selector: 'app-sb-welcome-page',
  template: '<section class="mat-typography" [innerHTML]="notes"></section>',
  styles: [':host { padding: 16px; display: block; }'],
})
export class WelcomeComponent implements OnInit {

  notes = '';

  constructor() { }

  ngOnInit(): void {
    this.notes = simpleMd.defaultHtmlOutput(simpleMd.defaultBlockParse(WELCOME_MD));
  }

}

storiesOf('Welcome', module)
  .addDecorator(
    moduleMetadata({
      declarations: [WelcomeComponent],
    })
  ).add('default', () => {
    return {
      template: `<app-sb-welcome-page></app-sb-welcome-page>`,
    };
  });
