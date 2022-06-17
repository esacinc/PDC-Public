import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayWindowService } from '../../overlay-window/overlay-window.service';

@Component({
  selector: 'app-data-download-doc',
  templateUrl: './data-download-documentation.component.html',
  styleUrls: ['./data-download-documentation.component.scss']
})
export class DataDownloadDocComponent implements OnInit {

  constructor(private overlayWindow: OverlayWindowService) { }

  ngOnInit() {}

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
