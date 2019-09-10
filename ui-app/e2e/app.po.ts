import { browser, by, element } from 'protractor';
import { SelectPipe } from 'apollo-angular';
import { PDCUserService } from '../src/app/pdcuser.service';

export class AppPage {
  navigateTo() {
    return browser.get('/');
  }
  
  getPageTitle() {
		return browser.getTitle();
  }
  
  getWelcomeText() {
    return element(by.css('mat-card h2')).getText();
  }
  clickGoogleLogin() {
    
    element(by.id('socialSignIn')).click().then(function() {
      browser.sleep(80000);
    });
  }
  getParagraphText() {
    return element(by.css('app-root h1')).getText();
  }
}
