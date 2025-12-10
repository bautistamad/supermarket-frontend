import { Component } from '@angular/core';
import { IMessage } from '../../models/i-message';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.css']
})
export class MessageDialogComponent {
  message: IMessage | undefined;

  constructor(public activeModal: NgbActiveModal) { }
}
