import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PDCUserService } from '../../pdcuser.service';
import { OverlayWindowService } from '../../overlay-window/overlay-window.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
	
  isUserLoggedIn:boolean = false;	
  private subscription: Subscription;

  constructor(private userService: PDCUserService, private route:ActivatedRoute,  private overlayWindow: OverlayWindowService) { }

  ngOnInit() {
    //@@@PDC-1702: Add a button/help link to FAQ page multiple download section from Browse page
    this.route.paramMap.subscribe(params => {
      //Fetch the query params in order to scroll to that section.
      //Eg: URL Type: pdc-dev.esacinc.com/faq/Multiple_Files
      let scrollSection = params.get("id");
      if (scrollSection !=null ||scrollSection != undefined) {
        var x = document.getElementById(scrollSection);
        x.scrollIntoView();
      }
    });
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

  //@@@PDC-1628: Update the FAQ page on the data portal
  //Scroll to a particular section of the page.
  scrollToElement($element): void {
    $element.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
  }

}
