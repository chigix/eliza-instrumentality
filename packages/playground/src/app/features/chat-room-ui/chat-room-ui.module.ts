import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { InputSpaceComponent } from './input-space/input-space.component';
import { MessageListComponent } from './message-list/message-list.component';

@NgModule({
  declarations: [InputSpaceComponent, MessageListComponent],
  imports: [
    CommonModule, FormsModule,
    MatFormFieldModule, MatInputModule, MatIconModule,
    MatButtonModule, MatChipsModule,
  ],
  exports: [InputSpaceComponent, MessageListComponent],
})
export class ChatRoomUiModule { }
