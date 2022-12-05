import { Component, OnInit,  ViewChild, ElementRef, ViewEncapsulation} from '@angular/core';
import { Subscription } from 'rxjs';
import { OverlayWindowService } from '../../overlay-window/overlay-window.service';
//@@PDC-5573 update download documentation
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import {DataDownloadDocumentationService} from './data-download-documentation.service'

@Component({
  selector: 'app-data-download-doc',
  templateUrl: './data-download-documentation.component.html',
  styleUrls: ['./data-download-documentation.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DataDownloadDocComponent implements OnInit {
  fragment;
  data;
  binaryDistributions;
  installationInfo;
  content;
  note;
  title;
  description;
  system_requirements;

  //@@@PDC-5717: Develop the JSON file for the Data Download Page
  constructor(private route:ActivatedRoute,private overlayWindow: OverlayWindowService,private viewportScroller: ViewportScroller,
    private downloadDocumentationService: DataDownloadDocumentationService) { 
      this.downloadDocumentationService.getDocumentation().subscribe((data: any) => {
        //console.log(data);
        this.data = data;
        if (data.note) this.note = data.note;
        if (data.title) this.title = data.title;
        if (data.description) this.description = data.description;
        if (data.installation) {
          if (data.installation.binary_distributions) this.binaryDistributions = data.installation.binary_distributions;
          if (data.installation.system_requirements) this.system_requirements = data.installation.system_requirements
          if (data.installation.information) this.installationInfo = data.installation.information;
        }
        if (data.content && data.content.links) {
          this.content = data.content.links
        }
      });
    }

  ngOnInit() {
    //@@PDC-5573 update download documentation
    this.route.fragment.subscribe(fragment => { this.fragment = fragment; });
  }

  //Fix loading issues
  ngAfterViewChecked(): void {
    try {
        if(this.fragment) {
            document.querySelector('#' + this.fragment).scrollIntoView();
            //set fragment back to empty in order to enable scrolling after div scrolled into view
            this.fragment = "";
         }
    } catch (e) { }
}

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
