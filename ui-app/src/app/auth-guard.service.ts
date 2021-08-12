// src/app/auth/auth-guard.service.ts
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(public router: Router) {}
  canActivate(): boolean {
    let pathName = window.location.pathname;
    pathName = pathName.toLowerCase();
    if(pathName.startsWith("/study-summary/")){
      if(pathName.split('/').length == 3){
        window.location.href = window.location.origin+"/pdc/forwarding/"+pathName.split('/')[2];
        //this.router.navigate(['forwarding/'+pathName.split[2]]);
      }
    }else if (pathName.startsWith("/cptac/s/") ){
      if(pathName.split('/').length == 4){
        window.location.href = window.location.origin+"/pdc/forwarding/"+pathName.split('/')[3];
        //this.router.navigate(['forwarding/'+pathName.split[3]]);
      }
    }
    return true;
  }
}
