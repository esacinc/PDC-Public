import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // let pathName = window.location.pathname;
    // pathName = pathName.toLowerCase();
    // if(pathName.startsWith("/study-summary/")){
    //   if(pathName.split('/').length == 3){
    //     window.location.href = window.location.origin+"/pdc/forwarding/"+pathName.split('/')[2];
    //     //this.router.navigate(['forwarding/'+pathName.split[2]]);
    //   }
    // }else if (pathName.startsWith("/cptac/s/") ){
    //   if(pathName.split('/').length == 4){
    //     window.location.href = window.location.origin+"/pdc/forwarding/"+pathName.split('/')[3];
    //     //this.router.navigate(['forwarding/'+pathName.split[3]]);
    //   }
    // }
  }

}
