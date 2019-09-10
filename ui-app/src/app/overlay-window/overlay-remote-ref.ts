import { OverlayRef } from '@angular/cdk/overlay';
import { Injectable } from '@angular/core';

@Injectable()
//@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
//Remote reference for closing the overlay window from a component.
export class OverlayRemoteRef {
  constructor(private overlayRef: OverlayRef) { }

  //Closes the overlay window
  close(): void {
    this.overlayRef.dispose();
    sessionStorage.setItem("overlayLoad","true");
  }
}