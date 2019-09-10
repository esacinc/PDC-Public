import { Injectable, Inject, OnInit, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { StudySummaryOverlayWindowComponent } from './study-summary-overlay-window.component';
import { DUAForOtherProgramsOverlayWindow } from './dua-other-programs/dua-other-programs-overlay-window.component';
import { StudySummaryOverlayRemoteRef } from './study-summary-overlay-remote-ref';

// Define config properties required for overlay window.
interface FilePreviewDialogConfig {
  panelClass?: string;
  hasBackdrop?: boolean;
  backdropClass?: string;
}

// Set config properties required for overlay window.
const DEFAULT_CONFIG: FilePreviewDialogConfig = {
  hasBackdrop: true,
  backdropClass: 'overlay-screen-backdrop',
  panelClass: 'overlay-screen-dialog-panel'
}

@Injectable()
//@@@PDC-843: Add embargo date and data use statement to CPTAC studies
//Service class to build, open and close the overlay window.
export class StudySummaryOverlayService {

  constructor(
    private injector: Injector,
    private overlay: Overlay) { }

  // Opens an overlay window.
  open(renderedComponent = '', config: FilePreviewDialogConfig = {}) {
    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);
    var component = 'StudySummaryOverlayWindowComponent';
    if (renderedComponent != '') {
      component = renderedComponent;
    }
    // Instantiate remote control
    const dialogRef = new StudySummaryOverlayRemoteRef(overlayRef);
    const overlayComponent = this.attachDialogContainer(overlayRef, dialogConfig, dialogRef, component);
    //Closes the overlay on background click. Might be useful in the future.
    //overlayRef.backdropClick().subscribe(_ => dialogRef.close());
    return dialogRef;
  }

  // Creates overlay window with the properties defined in config.
  private createOverlay(config: FilePreviewDialogConfig) {
    const overlayConfig = this.getOverlayConfig(config);
    return this.overlay.create(overlayConfig);
  }

  // Attaches overlay component with the container, injects OverlayRemoteRef to component.
  private attachDialogContainer(overlayRef: OverlayRef, config: FilePreviewDialogConfig, dialogRef: StudySummaryOverlayRemoteRef, renderedComponent) {
    const injector = this.createInjector(config, dialogRef);
    if (renderedComponent == "StudySummaryOverlayWindowComponent") {
      const containerPortal = new ComponentPortal(StudySummaryOverlayWindowComponent, null, injector);
      const containerRef: ComponentRef<StudySummaryOverlayWindowComponent> = overlayRef.attach(containerPortal);
      return containerRef.instance;
    } else if (renderedComponent == "DUAForOtherProgramsOverlayWindow") {
      const containerPortal = new ComponentPortal(DUAForOtherProgramsOverlayWindow, null, injector);
      const containerRef: ComponentRef<DUAForOtherProgramsOverlayWindow> = overlayRef.attach(containerPortal);
      return containerRef.instance;
    }
  }

  // Defines injector for passing OverlayRemoteRef to OverlayWindowComponent (for overlay close operation)
  private createInjector(config: FilePreviewDialogConfig, dialogRef: StudySummaryOverlayRemoteRef): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(StudySummaryOverlayRemoteRef, dialogRef);
    return new PortalInjector(this.injector, injectionTokens);
  }

  // Set properties required for overlay window.
  private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    const overlayConfig = new OverlayConfig({
      hasBackdrop: config.hasBackdrop,
      backdropClass: config.backdropClass,
      panelClass: config.panelClass,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      positionStrategy
    });

    return overlayConfig;
  }
}