import { Component, OnInit } from '@angular/core';
import { StudySummaryOverlayRemoteRef } from './study-summary-overlay-remote-ref'

@Component({
  selector: 'app-study-summary-overlay-window',
  templateUrl: './study-summary-overlay-window.component.html',
  styleUrls: ['./study-summary-overlay-window.component.css']
})
//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
export class StudySummaryOverlayWindowComponent {

  // This function closes the overlay window on click event.
  acceptDisclaimer() {
      this.dialogRef.close();
  } 

  constructor(
    public dialogRef: StudySummaryOverlayRemoteRef) { }

}
