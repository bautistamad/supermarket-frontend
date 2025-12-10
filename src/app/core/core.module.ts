import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageDialogComponent } from './components/message-dialog/message-dialog.component';

@NgModule({
  declarations: [
    MessageDialogComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    MessageDialogComponent
  ]
})
export class CoreModule { }
