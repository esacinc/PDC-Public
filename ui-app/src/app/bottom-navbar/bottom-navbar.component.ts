import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { PDCUserService } from '../pdcuser.service';
import { OverlayWindowService } from '../overlay-window/overlay-window.service';
import { BottomNavbarService } from '../bottom-navbar/bottom-navbar.service';
import { ReleaseVersionData} from '../types';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss'],
  providers: [ BottomNavbarService ]
})
export class BottomNavbarComponent implements OnInit {
	
  isUserLoggedIn:boolean = false;	
  private subscription: Subscription;
  bottomNavDisplayFlag:boolean  = true;
  homePageURL = "/";
  tag: string;
  loadingReleaseData: boolean = false;
  releaseVersionsData: ReleaseVersionData[] = [];
  
  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  constructor(private http: HttpClient, private userService: PDCUserService, private router: Router,  private overlayWindow: OverlayWindowService, private bottomNavbarService: BottomNavbarService,) {
    //@@@PDC-3163: Add data release version to the UI
    this.getReleaseVersionData();
  }

  //@@@PDC-3163: Add data release version to the UI
  getReleaseVersionData(){
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

  ngOnInit() {
    this.tag = environment['BUILD_TAG'] || 'No build tag specified';
	  // this.subscription = this.userService.isLoggedIn.subscribe(
		// 					isLoggedIn => {
    //             this.isUserLoggedIn = isLoggedIn;
		// 						if ( this.isUserLoggedIn ) {
		// 							console.log('User logged in as ' + this.userService.getUserName());
    //             } 
    //           }            
    // ); 
    this.router.events.subscribe(event =>{
			if (event instanceof NavigationEnd) {
				if(event.url === '/welcome' || event.url === '/registration'){
					this.bottomNavDisplayFlag = false;
				}else{
					this.bottomNavDisplayFlag = true;
				}
			}
    });
    //@@@PDC-1716: Update the site url to just the domain name and drop any path
    if (window.location.hostname == "localhost") {
			this.homePageURL = "/pdc";
		}
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
