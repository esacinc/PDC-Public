import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
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

  constructor(private userService: PDCUserService, private router: Router,  private overlayWindow: OverlayWindowService) { }

  ngOnInit() {
  }

  //@@@PDC 707: Add privacy notice to user registration page and in footer of all pages
  viewPrivacyPolicy() {
    this.overlayWindow.open('PrivacyPolicyOverlayWindowComponent');
  }

}
