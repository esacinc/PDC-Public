import { Component, OnInit } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';

import { ChorusLab } from '../../types';
import { ChorusauthService } from '../../chorusauth.service';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MatLegacyDialogConfig as MatDialogConfig, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Inject } from '@angular/core';

@Component({
  selector: 'app-lab-selection',
  templateUrl: './lab-selection.component.html',
  styleUrls: ['./lab-selection.component.css']
})
export class LabSelectionComponent implements OnInit {
  firstName = '';
  lastName = '';
  userEmail = '';
  username = '';
  labs$: Observable<ChorusLab[]>;
  private searchTerms = new Subject<string>();
  selectedLabs: ChorusLab[] = [];
  searchTerm = '';

  constructor(private chorusService: ChorusauthService,
    private dialogRef: MatDialogRef<LabSelectionComponent>,
    @Inject(MAT_DIALOG_DATA) data) {
    this.userEmail = data.userEmail;
    this.username = data.username;
    const splitName = this.username.split(' ');
    this.firstName = splitName[0];
    this.lastName = splitName[1];
   }

  ngOnInit() {
    this.labs$ = this.searchTerms.pipe(
      // wait 300ms after each keystroke before considering the term
      debounceTime(300),

      // ignore new term if same as previous term
      distinctUntilChanged(),

      // switch to new search observable each time the term changes
      switchMap((term: string) => this.chorusService.searchLabs(term, this.selectedLabs)),
    );
  }

  // Push a search term into the observable stream.
  public search(term: string): void {
    this.searchTerms.next(term);
  }

  // Add a lab to the selected list and allow them to register
  public addLab(lab: ChorusLab): void {
    this.selectedLabs.push(lab);
    window.document.getElementById('register').removeAttribute('disabled');
    this.searchTerm = '';
    this.search(this.searchTerm);
  }

  // Register the user with Chorus
  public registerUser() {
    const labIds: number[] = [];

    // Get just the ids of the labs to send with the registration
    for (let i = 0; i < this.selectedLabs.length; i++) {
      labIds.push(this.selectedLabs[i].id);
    }

    this.chorusService.createUser(this.username, this.userEmail, labIds);
    alert('Thanks for your request to register with a PDC Program. You will receive an email notifying you of your approval status for the Programs you selected. If approved you will be able to login to the workspace when you visit next time.');
    this.dialogRef.close();
  }

  // Close the dialog
  public close(status: string): void {
    this.dialogRef.close();
  }
}
