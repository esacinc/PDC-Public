import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

@Injectable()
//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
//Remote reference for closing the overlay window from a component.
export class StudySummaryOverlayRemoteRef {
  constructor(private overlayRef: OverlayRef) { }

  //Closes the overlay window
  close(): void {
    this.overlayRef.dispose();
    sessionStorage.setItem("overlayLoad","true");
  }
}