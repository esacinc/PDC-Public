import { environment } from './../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { Component, Renderer2, ElementRef, AfterViewChecked } from '@angular/core';
import { OverlayWindowService } from './overlay-window/overlay-window.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css', '../assets/css/global.css'],
    standalone: false
})
//@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
//@@@PDC-412 Implement more details google analytics
//@@@PDC-1159: Add ability to collapse charts on Browse table
export class AppComponent implements AfterViewChecked {
  title = 'app';
  constructor(private router: Router,  private overlayWindow: OverlayWindowService, private elRef:ElementRef, private _renderer: Renderer2) {
    this.router.events.subscribe(event => {
     if (event instanceof NavigationEnd) {
       (<any>window).gtag('config', environment.GA_TRACKING_ID, {
        'page_path': event.urlAfterRedirects
       });
     }
   });
  //@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
  // Opens the overlay window on app load
  if (!sessionStorage.length) {
    this.overlayWindow.open();
  }
 }

  //@@@PDC-1039: Run 508 Compliance check on all PDC Browser pages and fix any issues
  //Add aria-label/title attributes to elements after DOM has loaded.
	//Accessibility has not been fixed in paginator in primeng lib: https://github.com/primefaces/primeng/pull/7422
	//This code is not required if primeng is update to add accessibolity to primeng Paginator
  ngAfterViewChecked() {
      //Hotjar buttons with no title with class name of format: _hj-f5b2a1eb-9b07_btn_primary _hj-f5b2a1eb-9b07_rounded_corners
      // Add aria-label attribute to Hotjar empty buttons
      let hotjarButtonElements = document.querySelectorAll('button[class^="_hj"][class$="_rounded_corners"]');
      for (var i = 0; i < hotjarButtonElements.length; i++) {
        this._renderer.setAttribute(hotjarButtonElements[i], 'aria-label', 'Hotjar Feedback button');
      }
      //Hotjar input/textarea elements with no title with class name of format: _hj-f5b2a1eb-9b07_input_field
      // Add title attribute to Hotjar input fields
      let hotjarInputElements = document.querySelectorAll('input[class^="_hj"][class$="_input_field"],textarea[class^="_hj"][class$="_input_field"]');
      for (var i = 0; i < hotjarInputElements.length; i++) {
        this._renderer.setAttribute(hotjarInputElements[i], 'title', 'Hotjar Input button');
      }
      // Add aria-label attribute to p-table: Paginator elements
      let nxtElements = this.elRef.nativeElement.querySelectorAll('.ui-paginator-next');
      for (var i = 0; i < nxtElements.length; i++) {
        this._renderer.setAttribute(nxtElements[i], 'aria-label', 'Navigate to next page');
      }
      let prevElements = this.elRef.nativeElement.querySelectorAll('.ui-paginator-prev');
      for (var i = 0; i < prevElements.length; i++) {
        this._renderer.setAttribute(prevElements[i], 'aria-label', 'Navigate to Prev page');
      }
      let firstElements = this.elRef.nativeElement.querySelectorAll('.ui-paginator-first');
      for (var i = 0; i < firstElements.length; i++) {
        this._renderer.setAttribute(firstElements[i], 'aria-label', 'Navigate to First page');
      }
      let lastElements = this.elRef.nativeElement.querySelectorAll('.ui-paginator-last');
      for (var i = 0; i < lastElements.length; i++) {
        this._renderer.setAttribute(lastElements[i], 'aria-label', 'Navigate to Last page');
      }
      let checkboxElements = this.elRef.nativeElement.querySelectorAll('.browsePageCheckboxes input[type="checkbox"]');
      for (var i = 0; i < checkboxElements.length; i++) {
        this._renderer.setAttribute(checkboxElements[i], 'title', 'Select this row');
      }
      //@@@PDC-1159: Add ability to collapse charts on Browse table
      let matExpansionIndicator = this.elRef.nativeElement.querySelectorAll('.mat-expansion-indicator');
      for (var i = 0; i < matExpansionIndicator.length; i++) {
        this._renderer.setAttribute(matExpansionIndicator[i], 'title', 'Expand/Collapse the charts section');
      }
  }
}
