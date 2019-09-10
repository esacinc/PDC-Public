// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { PDCUserService } from './pdcuser.service';
@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public auth: PDCUserService, public router: Router) {}
  canActivate(): boolean {
    // console.log('User Id', this.auth.getUserName());
    // If testing then see if we have a refresh token
    //@@@PDC-709: User remains logged in forever if their session does not time out before they close the browser
    //@@@PDC-552: Check if session storage has the user information i.e; if user is logged in
    if (sessionStorage.getItem("loginToken") == "true") {
        this.auth.setIsLoggedIn(true);
        return true;
    } else if(this.auth.getEmail().length < 1) {
	    //if (this.auth.isUserLoggedIn() ) {
      this.router.navigate(['welcome']);
      this.auth.setIsLoggedIn(false);
      sessionStorage.clear();
      localStorage.clear();
      return false;
    } else {
      return true;
    }
  }
}
