import { Component, OnInit } from '@angular/core';
import { OverlayRemoteRef } from '../overlay-remote-ref'

@Component({
    selector: 'app-privacy-policy-overlay-window',
    templateUrl: './privacy-policy-overlay-window.component.html',
    styleUrls: ['../overlay-window.component.scss'],
    standalone: false
})
//@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
export class PrivacyPolicyOverlayWindowComponent {

  // This function closes the overlay window on click event.
  acceptDisclaimer() {
      this.dialogRef.close();
  } 

  constructor(
    public dialogRef: OverlayRemoteRef) { }

}
