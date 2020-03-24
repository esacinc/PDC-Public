import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { PDCUserService } from '../pdcuser.service';
import { OverlayWindowService } from '../overlay-window/overlay-window.service';

@Component({
  selector: 'app-bottom-navbar',
  templateUrl: './bottom-navbar.component.html',
  styleUrls: ['./bottom-navbar.component.scss']
})
export class BottomNavbarComponent implements OnInit {
	
  isUserLoggedIn:boolean = false;	
  private subscription: Subscription;
  bottomNavDisplayFlag:boolean  = true;
  homePageURL = "/";
  tag: string;
  
  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  constructor(private http: HttpClient, private userService: PDCUserService, private router: Router,  private overlayWindow: OverlayWindowService) { }

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
