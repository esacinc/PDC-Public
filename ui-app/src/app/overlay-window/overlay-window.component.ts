import { Component } from '@angular/core';
import { OverlayRemoteRef } from './overlay-remote-ref';

@Component({
    selector: 'app-overlay-window',
    templateUrl: './overlay-window.component.html',
    styleUrls: ['./overlay-window.component.scss'],
    standalone: false
})

//@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
export class OverlayWindowComponent {
    // This function closes the overlay window on click event.
    acceptDisclaimer() {
        this.dialogRef.close();
    } 
  
    constructor(
      public dialogRef: OverlayRemoteRef) { }
}
