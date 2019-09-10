import { Injectable, Inject, OnInit, Injector, ComponentRef } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { OverlayWindowComponent } from './overlay-window.component';
import { OverlayRemoteRef } from './overlay-remote-ref';
import { PrivacyPolicyOverlayWindowComponent } from './privacy-policy-overlay-window/privacy-policy-overlay-window.component';

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
//@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
//Service class to build, open and close the overlay window.
export class OverlayWindowService {

  constructor(
    private injector: Injector,
    private overlay: Overlay) { }

  // Opens an overlay window.
  open(renderedComponent = '', config: FilePreviewDialogConfig = {}) {
    // Override default configuration
    const dialogConfig = { ...DEFAULT_CONFIG, ...config };
    // Returns an OverlayRef which is a PortalHost
    const overlayRef = this.createOverlay(dialogConfig);
    // Instantiate remote control
    const dialogRef = new OverlayRemoteRef(overlayRef);
    var component = 'OverlayWindowComponent';
    if (renderedComponent != '') {
      component = renderedComponent;
    }
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
  private attachDialogContainer(overlayRef: OverlayRef, config: FilePreviewDialogConfig, dialogRef: OverlayRemoteRef, renderedComponent) {
    const injector = this.createInjector(config, dialogRef);
    //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
    if (renderedComponent == "OverlayWindowComponent") {
      const containerPortal = new ComponentPortal(OverlayWindowComponent, null, injector);
      const containerRef: ComponentRef<OverlayWindowComponent> = overlayRef.attach(containerPortal);
      return containerRef.instance;
    } else if (renderedComponent == "PrivacyPolicyOverlayWindowComponent") {
      const containerPortal = new ComponentPortal(PrivacyPolicyOverlayWindowComponent, null, injector);
      const containerRef: ComponentRef<PrivacyPolicyOverlayWindowComponent> = overlayRef.attach(containerPortal);
      return containerRef.instance;
    }
  }

  // Defines injector for passing OverlayRemoteRef to OverlayWindowComponent (for overlay close operation)
  private createInjector(config: FilePreviewDialogConfig, dialogRef: OverlayRemoteRef): PortalInjector {
    const injectionTokens = new WeakMap();
    injectionTokens.set(OverlayRemoteRef, dialogRef);
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