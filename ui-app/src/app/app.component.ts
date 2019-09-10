import { environment } from './../environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { Component } from '@angular/core';
import { OverlayWindowService } from './overlay-window/overlay-window.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', '../assets/css/global.css']
})
//@@@PDC-724: Need to develop overlay notice when user first opens PDC browser
//@@@PDC-412 Implement more details google analytics
export class AppComponent {
  title = 'app';
  constructor(private router: Router,  private overlayWindow: OverlayWindowService) {
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
}
