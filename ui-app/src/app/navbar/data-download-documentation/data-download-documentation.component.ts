import { Component, OnInit,  ViewChild, ElementRef} from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayWindowService } from '../../overlay-window/overlay-window.service';
//@@PDC-5573 update download documentation
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

@Component({
  selector: 'app-data-download-doc',
  templateUrl: './data-download-documentation.component.html',
  styleUrls: ['./data-download-documentation.component.scss']
})
export class DataDownloadDocComponent implements OnInit {
  fragment;

  constructor(private route:ActivatedRoute,private overlayWindow: OverlayWindowService,private viewportScroller: ViewportScroller) { }

  ngOnInit() {
    //@@PDC-5573 update download documentation
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
