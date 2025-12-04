import { Component, OnInit } from '@angular/core';
import { BottomNavbarService } from '../bottom-navbar/bottom-navbar.service';
import { ReleaseVersionData } from '../types';
import {OverlayWindowService} from '../overlay-window/overlay-window.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  providers: [BottomNavbarService],
  standalone: false
})
export class FooterComponent implements OnInit {

  loadingReleaseData = false;
  releaseVersionsData: ReleaseVersionData = {data_release: '', build_tag: ''};

  constructor(private bottomNavbarService: BottomNavbarService, private overlayWindow: OverlayWindowService) {

  }

  ngOnInit(): void {
    this.getReleaseVersionData();
  }

  /*
  * Get the release version data from the backend
  *
  */
  getReleaseVersionData() {
    this.loadingReleaseData = true;
    setTimeout(() => {
      this.bottomNavbarService.getReleaseVersionDetails().subscribe((data: any) =>{
        if (data && data.uiDataVersionSoftwareVersion && data.uiDataVersionSoftwareVersion[0]) {
          this.releaseVersionsData =  data.uiDataVersionSoftwareVersion[0];
        }
        this.loadingReleaseData = true;
      });
    }, 1000);
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
