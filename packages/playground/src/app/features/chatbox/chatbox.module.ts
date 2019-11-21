import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';

import { ChatboxComponent } from './chatbox.component';

@NgModule({
  declarations: [ChatboxComponent],
  imports: [
    CommonModule,
    MatChipsModule,
  ],
  exports: [ChatboxComponent],
})
export class ChatboxModule { }
