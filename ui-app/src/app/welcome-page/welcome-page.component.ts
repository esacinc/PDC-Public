import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import {map} from 'rxjs/operators';
import { AuthService, GoogleLoginProvider } from 'angular-6-social-login';
import { ChorusauthService } from '../chorusauth.service';
import { environment } from '../../environments/environment';
import { PDCUserService } from '../pdcuser.service';

@Component({
  selector: 'welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['../../assets/css/global.css', './welcome-page.component.scss']
})

//@@@PDC-371 Develop PDC welcome screen 
//@@@PDC-516 angular lazy loading 
export class WelcomePageComponent implements OnInit {

  username:string = '';
  userEmail:string = '';
  systemErrorMessage:string = '';

  constructor(private chorusService: ChorusauthService, private socialAuthService: AuthService,
				private router: Router, private http: HttpClient, private userService: PDCUserService,
				private activeRoute: ActivatedRoute) {
				}
  
  // Authenticate the user with Google
  //@@@PDC-419 handle system error		
  public socialSignIn(socialPlatform: string) {
    const socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    this.systemErrorMessage='';
    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        // Now that they are logged in check to see if the user is registered in PDC
        this.userService.checkPDCUserByEmail(userData.email).then(exists => {
		switch (exists) {
			//user exists
			case 0: 
				//'' route url will be welcome page to login. 'pdc' route url will be home page
				this.router.navigate(['pdc']);
				break;
			//user does not exist
			case 1: 
				console.log(userData);
				this.userService.setUserIDType("Google");
				this.userService.setLoginUsername(userData.email);
				this.userService.setEmail(userData.email); 
				this.userService.setName(userData.name);
				this.router.navigate(['registration']);
				break;
			//system error
			case 2:
				this.systemErrorMessage="System Error. Please contact your system admin";
				console.log("System error!!!");
				break;				
		}
        });
    });
  }
  
  //User used eRA/NIH login credentials
	//@@@PDC-419 handle system error		
  //@@@PDC-784 Improve download controlled files feature
   public eRAnihSignIn(uid: string){
    this.systemErrorMessage='';
	  this.userService.checkPDCUser(uid).subscribe(registered => {
		switch (registered) {
			//user registered
			case 0:
				//'' route url will be welcome page to login. 'pdc' route url will be home page
				if(localStorage.getItem('controlledFileExportFlag') === 'true'){
					localStorage.removeItem('controlledFileExportFlag');
					document.location.href = environment.dcf_fence_login_url;
					this.router.navigate(['browse']);
				}else{
					this.router.navigate(['pdc']);
				}
				break;
			//user not registered
			case 1:
				if (this.userService.getEmail()) {
					this.userService.setUserIDType("NIH");
				} else {
					this.userService.setUserIDType("eRA");
				}
        this.router.navigate(['registration']);
				break;
			//system error
			case 2:
				this.systemErrorMessage="System Error. Please contact your system admin";
				console.log("System error!!!");
				break;				
		}
		});	   
  }
  
  ngOnInit() {
    //@@@PDC-709: User remains logged in forever if their session does not time out before they close the browser
    //@@@PDC-552: Check if session storage has the user information i.e; if user is logged in
	  if (sessionStorage.getItem("loginToken") == "true") {
			this.router.navigate(['pdc']);
		}
	  // If the user uses eRA/NIH login, it will be returned back bu pdcapi with uid parameter defined
	this.activeRoute.queryParams.subscribe(queryParams => {
		console.log(queryParams);
		if (queryParams.uid){
			this.eRAnihSignIn(queryParams.uid);
		}				
	});
  }

}
