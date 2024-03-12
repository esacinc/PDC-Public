import { Component, Inject, OnInit } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import {UntypedFormControl, Validators} from '@angular/forms';

export interface DialogData {
  message: string;
  input: string;
}

@Component({
  selector: 'app-email-dialog',
  templateUrl: './input-dialog.component.html',
  styleUrls: ['./input-dialog.component.css']
})
export class InputDialogComponent implements OnInit {

  email = new UntypedFormControl('', [Validators.required, Validators.email]);

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

}
